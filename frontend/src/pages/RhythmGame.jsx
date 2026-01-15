import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import './RhythmGame.css';

// --- [설정] 감정별 공평성 보정 데이터 ---
const EMOTION_CONFIG = {
  neutral:   { weight: 1.0, perfect: 0.90, good: 0.50 }, 
  happy:     { weight: 1.4, perfect: 0.80, good: 0.45 }, 
  surprised: { weight: 1.3, perfect: 0.75, good: 0.40 }, 
  angry:     { weight: 1.7, perfect: 0.60, good: 0.30 }, 
  sad:       { weight: 1.4, perfect: 0.55, good: 0.25 }  
};

const EMOTIONS = Object.keys(EMOTION_CONFIG);
const EMOJI_MAP = { happy: '😊', sad: '😭', angry: '😡', neutral: '😐', surprised: '😮' };

const HIT_TIMING_MS = 2820; 
const DETECTION_OPTIONS = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 }); 
const GAME_LIMIT_MS = 30000; 

const RhythmGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedSong = location.state?.song || { title: "기본 곡", url: "/assets/song_30s.mp3" };

  const [gameState, setGameState] = useState('ready'); 
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [notes, setNotes] = useState([]);
  const [score, setScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0); 
  const [judgement, setJudgement] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(new Audio());
  const latestExpressionsRef = useRef({});
  const isDetecting = useRef(false);
  const gameLoopRef = useRef(null);
  const noteTimeoutRef = useRef(null);
  const endTimerRef = useRef(null);

  // 1. 모델 로드 및 웹캠 설정
  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        setIsModelLoaded(true);
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480, frameRate: { ideal: 30 } } 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { console.error("초기화 실패:", err); }
    };
    init();
    return () => stopGame();
  }, []);

  // 2. 실시간 표정 감지 루프
  const detectExpressions = useCallback(async () => {
    if (!videoRef.current || videoRef.current.paused || isDetecting.current) return;
    
    isDetecting.current = true;
    const detections = await faceapi.detectAllFaces(videoRef.current, DETECTION_OPTIONS).withFaceExpressions();

    if (detections.length > 0) {
      const expressions = detections[0].expressions;
      latestExpressionsRef.current = expressions;
      
      let bestEmotion = 'neutral';
      let maxScore = -1;

      EMOTIONS.forEach(em => {
        const weightedScore = expressions[em] * EMOTION_CONFIG[em].weight;
        if (weightedScore > maxScore) {
          maxScore = weightedScore;
          bestEmotion = em;
        }
      });
      // 감지된 즉시 상태 업데이트 (레인 색상 변경 트리거)
      setCurrentEmotion(bestEmotion); 
    }
    isDetecting.current = false;
    requestAnimationFrame(detectExpressions);
  }, []);

  const judgeNote = useCallback((noteEmotion) => {
    const rawProb = latestExpressionsRef.current[noteEmotion] || 0;
    const config = EMOTION_CONFIG[noteEmotion];
    
    let res = { text: 'Miss', type: 'miss', add: 0 };
    if (rawProb >= config.perfect) res = { text: 'Perfect!', type: 'perfect', add: 100 };
    else if (rawProb >= config.good) res = { text: 'Good!', type: 'good', add: 50 };
    
    setScore(prev => Math.max(0, prev + res.add));
    setJudgement({ text: res.text, type: res.type });
    setTimeout(() => setJudgement(null), 500);
  }, []);

  const startGameLoop = useCallback(() => {
    gameLoopRef.current = setInterval(() => {
      const now = Date.now();
      setNotes(prevNotes => {
        return prevNotes.map(note => {
          if (!note.judged && now >= note.hitTime) {
            judgeNote(note.emotion);
            return { ...note, judged: true };
          }
          return note;
        }).filter(note => now < note.hitTime + 500);
      });
    }, 16);
  }, [judgeNote]);

  const scheduleNextNote = useCallback(() => {
    const randomEm = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    const now = Date.now();
    setNotes(prev => [...prev, { id: now, emotion: randomEm, hitTime: now + HIT_TIMING_MS, judged: false }]);
    noteTimeoutRef.current = setTimeout(scheduleNextNote, Math.random() * 2000 + 1000); 
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setAnimatedScore(0);
    audioRef.current.src = selectedSong.url;
    audioRef.current.play();
    startGameLoop();
    scheduleNextNote();
    audioRef.current.onended = () => endGame();
    endTimerRef.current = setTimeout(() => { endGame(); }, GAME_LIMIT_MS);
  };

  const endGame = () => {
    stopGame();
    setGameState('finished');
  };

  const stopGame = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
    if (endTimerRef.current) clearTimeout(endTimerRef.current);
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  // 결과 화면 점수 애니메이션
  useEffect(() => {
    if (gameState === 'finished') {
      const startTime = performance.now();
      const duration = 1000; 
      const animate = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        let progress = Math.min(elapsedTime / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentCount = Math.floor(easedProgress * score);
        setAnimatedScore(currentCount < 0 ? 0 : currentCount);
        if (progress < 1) requestAnimationFrame(animate);
        else setAnimatedScore(score);
      };
      requestAnimationFrame(animate);
    }
  }, [gameState, score]);

  return (
    <div className="game-container">
      {!isModelLoaded && <div className="loading-overlay">감정 엔진 보정 중...</div>}
      
      {/* onPlay 시점에 detectExpressions 루프 시작 
        실제 레인 색상은 currentEmotion 상태에 따라 실시간 반영됨
      */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        onPlay={() => requestAnimationFrame(detectExpressions)} 
        className="webcam-bg" 
      />

      {gameState === 'ready' && isModelLoaded && (
        <div className="overlay-screen">
          <h1 className="game-title">Emotion Rhythm</h1>
          <p style={{ color: '#00ff00', marginBottom: '20px' }}>곡: {selectedSong.title}</p>
          <button className="menu-btn start" onClick={startGame}>게임 시작</button>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="overlay-screen result-screen">
          <p className="result-label">FINAL SCORE</p>
          <h1 className={`final-score-text ${animatedScore === score ? 'done' : 'counting'}`}>
            {animatedScore}
          </h1>
          <div className="button-group">
            <button className="menu-btn retry" onClick={startGame}>다시 시도</button>
            <button className="menu-btn home" onClick={() => navigate('/Home')}>메인 화면으로</button>
          </div>
        </div>
      )}

      {/* 게임 플레이 및 대기 상태 모두에서 레인 활성화 상태를 보여줌 */}
      {(gameState === 'playing' || gameState === 'ready') && (
        <>
          <div className="lane-container">
            {EMOTIONS.map((emotion) => (
              <div 
                key={emotion} 
                className={`lane ${emotion} ${currentEmotion === emotion ? 'active' : 'inactive'}`}
              >
                <div className="target-emoji">{EMOJI_MAP[emotion]}</div>
                {gameState === 'playing' && notes.filter(n => n.emotion === emotion && !n.judged).map(note => (
                  <div key={note.id} className="note-emoji rising">{EMOJI_MAP[note.emotion]}</div>
                ))}
              </div>
            ))}
          </div>
          
          {gameState === 'playing' && (
            <div className="ui-layer">
              {judgement && <div className={`judgement-display ${judgement.type}`}>{judgement.text}</div>}
              <div className="score-capsule">
                <span className="score-icon">⭐</span>
                <span className="score-label">SCORE</span>
                <span className="score-value">{score}</span>
              </div>
              <div className="hud top-hud">재생 중: {selectedSong.title}</div>
              <div className="time-limit-bar"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RhythmGame;