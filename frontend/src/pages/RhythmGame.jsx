import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import './RhythmGame.css';

// --- 설정 및 데이터 ---
const EMOTIONS = ['happy', 'sad', 'angry', 'neutral', 'surprised'];
const EMOJI_MAP = { happy: '😊', sad: '😭', angry: '😡', neutral: '😐', surprised: '😮' };

// [핵심 수정] 무표정(Neutral) 가중치를 압도적으로 높여 다른 감정이 튀는 걸 방지합니다.
const EMOTION_WEIGHTS = {
  neutral: 4.5,  // 무표정을 감정 인식의 우선순위 최상단으로 배치
  happy: 1.5,    
  angry: 1.6,    
  surprised: 1.3,
  sad: 0.5       // 슬픔이 무표정을 방해하지 않도록 가중치를 확 낮춤
};

const HIT_TIMING_MS = 2820; // 상단 이모지와 딱 겹치는 타이밍 (튜닝됨)
const DETECTION_OPTIONS = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 }); // 인식 감도 상향
const GAME_LIMIT_MS = 30000; 

const RhythmGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const selectedSong = location.state?.song || { 
    title: "기본 곡", 
    url: "/assets/song_30s.mp3" 
  };

  const [gameState, setGameState] = useState('ready'); 
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [notes, setNotes] = useState([]);
  const [score, setScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0); // [추가] 애니메이션용 점수 상태
  const [judgement, setJudgement] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(new Audio());
  const latestExpressionsRef = useRef({});
  const isDetecting = useRef(false);
  const gameLoopRef = useRef(null);
  const noteTimeoutRef = useRef(null);
  const endTimerRef = useRef(null);

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

  const detectExpressions = useCallback(async () => {
    if (!videoRef.current || videoRef.current.paused || isDetecting.current) return;
    isDetecting.current = true;
    const detections = await faceapi.detectAllFaces(videoRef.current, DETECTION_OPTIONS).withFaceExpressions();

    if (detections.length > 0) {
      const expressions = detections[0].expressions;
      latestExpressionsRef.current = expressions;

      let bestEmotion = currentEmotion;
      let maxScore = -1;

      EMOTIONS.forEach(em => {
        // [수정] 무표정일 때는 점수를 더 뻥튀기해서 다른 감정이 못 이기게 함
        const score = expressions[em] * (EMOTION_WEIGHTS[em] || 1);
        if (score > maxScore) {
          maxScore = score;
          bestEmotion = em;
        }
      });

      if (currentEmotion !== bestEmotion) setCurrentEmotion(bestEmotion);
    }
    isDetecting.current = false;
    requestAnimationFrame(detectExpressions);
  }, [currentEmotion]);

  // --- [판정 로직 강화] 무표정 전용 보정 ---
  const judgeNote = useCallback((noteEmotion) => {
    const rawScore = latestExpressionsRef.current[noteEmotion] || 0;
    
    // 무표정은 AI가 0.2~0.3만 줘도 "무표정이다"라고 인정해주도록 보너스를 부여
    let adjustedScore = rawScore;
    if (noteEmotion === 'neutral') {
      adjustedScore = rawScore * 3.0; // 무표정 인식률 3배 보정
    }

    const perfectThreshold = 0.8;
    const goodThreshold = 0.4;

    let res = { text: 'Miss', type: 'miss', add: 0 };

    if (adjustedScore >= perfectThreshold) {
      res = { text: 'Perfect!', type: 'perfect', add: 100 };
    } else if (adjustedScore >= goodThreshold) {
      res = { text: 'Good!', type: 'good', add: 50 };
    }

    setScore(prev => prev + res.add);
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
  // --- [추가] 점수 카운팅 애니메이션 로직 ---
  useEffect(() => {
    if (gameState === 'finished') {
      let start = 0;
      const end = score;
      if (start === end) {
        setAnimatedScore(end);
        return;
      }

      // 점수가 높을수록 더 빨리 올라가도록 설정 (약 1초 동안 실행)
      const duration = 1000; 
      const frameRate = 1000 / 60; // 60fps
      const totalFrames = Math.round(duration / frameRate);
      const increment = end / totalFrames;

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setAnimatedScore(end);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.floor(start));
        }
      }, frameRate);

    return () => clearInterval(timer);
  } else {
    // 게임이 시작되거나 준비 중일 때는 0으로 초기화
    setAnimatedScore(0);
  }
}, [gameState, score]);
  return (
    <div className="game-container">
      {!isModelLoaded && <div className="loading-overlay">감정 엔진 보정 중...</div>}
      <video ref={videoRef} autoPlay playsInline muted onPlay={() => requestAnimationFrame(detectExpressions)} className="webcam-bg" />

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
          <h1 className="final-score-text">{animatedScore}</h1>
          <div className="button-group">
            <button className="menu-btn retry" onClick={startGame}>다시 시도</button>
            <button className="menu-btn home" onClick={() => navigate('/Home')}>메인 화면으로</button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <>
          <div className="lane-container">
            {EMOTIONS.map((emotion) => (
              <div key={emotion} className={`lane ${emotion} ${currentEmotion === emotion ? 'active' : 'inactive'}`}>
                <div className="target-emoji">{EMOJI_MAP[emotion]}</div>
                {notes.filter(n => n.emotion === emotion && !n.judged).map(note => (
                  <div key={note.id} className="note-emoji rising">{EMOJI_MAP[note.emotion]}</div>
                ))}
              </div>
            ))}
          </div>
          {judgement && <div className={`judgement-display ${judgement.type}`}>{judgement.text}</div>}
          <div className="score-display">점수: {score}</div>
          <div className="hud top-hud" style={{ position: 'absolute', top: '20px', right: '20px', color: 'white', zIndex: 100 }}>
             재생 중: {selectedSong.title}
          </div>
          <div className="time-limit-bar"></div>
        </>
      )}
    </div>
  );
};

export default RhythmGame;