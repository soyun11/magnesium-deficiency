import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import './RhythmGame.css';

// --- [설정] 감정별 공평성 보정 데이터 ---
const EMOTION_CONFIG = {
  neutral:   { weight: 6.0, perfect: 0.90, good: 0.50 }, 
  happy:     { weight: 1.5, perfect: 0.80, good: 0.45 }, 
  surprised: { weight: 1.3, perfect: 0.75, good: 0.40 }, 
  angry:     { weight: 1.6, perfect: 0.60, good: 0.30 }, 
  sad:       { weight: 0.5, perfect: 0.55, good: 0.25 }  
};

const EMOTIONS = Object.keys(EMOTION_CONFIG);
const EMOJI_MAP = { happy: '😊', sad: '😭', angry: '😡', neutral: '😐', surprised: '😮' };

const BACKEND_URL = 'http://localhost:8080';
const DETECTION_OPTIONS = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 }); 
const GAME_LIMIT_MS = 30000; 

const RhythmGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // DB에서 가져온 노래 정보 (title, bpm, difficulty, file_path 등)
  const selectedSong = location.state?.song || { 
    title: "기본 곡", 
    bpm: 120, 
    difficulty: "Normal", 
    file_path: "/assets/song_30s.mp3" 
  };

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

  // --- [신규] 난이도 및 BPM 기반 속도/밀도 계산 ---
  const getGameSettings = useCallback(() => {
    const bpm = selectedSong.bpm || 100;
    const diff = selectedSong.difficulty || 'Normal';
    
    // BPM에 따른 기본 도달 시간 (BPM이 빠를수록 기본 속도 상승)
    let baseTiming = (60000 / bpm) * 4; 

    // 난이도별 배율 (속도 및 생성 간격)
    const diffModifiers = {
      'Easy':   { speed: 1.5, spawn: [2000, 3500] },
      'Normal': { speed: 1.0, spawn: [1000, 2000] },
      'Hard':   { speed: 0.7, spawn: [600, 1200] }
    };

    const config = diffModifiers[diff] || diffModifiers['Normal'];
    return {
      hitTiming: baseTiming * config.speed, // 최종 노트 도달 시간
      spawnRange: config.spawn             // 노트 생성 간격 범위
    };
  }, [selectedSong]);

  const { hitTiming, spawnRange } = getGameSettings();

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
      let bestEmotion = 'neutral';
      let maxScore = -1;
      EMOTIONS.forEach(em => {
        const weightedScore = expressions[em] * EMOTION_CONFIG[em].weight;
        if (weightedScore > maxScore) { maxScore = weightedScore; bestEmotion = em; }
      });
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
    if (gameState !== 'playing') return;
    const randomEm = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    const now = Date.now();
    
    // 동적으로 계산된 hitTiming을 각 노트에 부여
    setNotes(prev => [...prev, { 
      id: now, 
      emotion: randomEm, 
      hitTime: now + hitTiming, 
      judged: false,
      duration: hitTiming 
    }]);

    const nextDelay = Math.random() * (spawnRange[1] - spawnRange[0]) + spawnRange[0];
    noteTimeoutRef.current = setTimeout(scheduleNextNote, nextDelay); 
  }, [gameState, hitTiming, spawnRange]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setAnimatedScore(0);

    let songUrl = selectedSong.file_path || selectedSong.url;
    if (songUrl && songUrl.startsWith('/')) songUrl = `${BACKEND_URL}${songUrl}`;
    
    audioRef.current.src = songUrl;
    audioRef.current.play()
      .then(() => {
        startGameLoop();
        scheduleNextNote();
        audioRef.current.onended = () => endGame();
        endTimerRef.current = setTimeout(() => { endGame(); }, GAME_LIMIT_MS);
      })
      .catch(err => {
        alert("노래 재생 실패!");
        setGameState('ready');
      });
  };

  const endGame = () => { stopGame(); setGameState('finished'); };

  const stopGame = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
    if (endTimerRef.current) clearTimeout(endTimerRef.current);
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  useEffect(() => {
    if (gameState === 'finished') {
      const startTime = performance.now();
      const animate = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        let progress = Math.min(elapsedTime / 600, 1);
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
      <video ref={videoRef} autoPlay playsInline muted onPlay={() => requestAnimationFrame(detectExpressions)} className="webcam-bg" />

      {gameState === 'ready' && (
        <div className="overlay-screen">
          <h1 className="game-title">Emotion Rhythm</h1>
          <p className="song-info-text">곡: {selectedSong.title} | BPM: {selectedSong.bpm} | 난이도: {selectedSong.difficulty}</p>
          <button className="menu-btn start" onClick={startGame}>게임 시작</button>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="overlay-screen result-screen">
          <p className="result-label">FINAL SCORE</p>
          <h1 className={`final-score-text ${animatedScore === score ? 'done' : 'counting'}`}>{animatedScore}</h1>
          <div className="button-group">
            <button className="menu-btn retry" onClick={startGame}>다시 시도</button>
            <button className="menu-btn home" onClick={() => navigate('/Home')}>메인 화면으로</button>
          </div>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'ready') && (
        <>
          <div className="lane-container">
            {EMOTIONS.map((emotion) => (
              <div key={emotion} className={`lane ${emotion} ${currentEmotion === emotion ? 'active' : 'inactive'}`}>
                <div className="target-emoji">{EMOJI_MAP[emotion]}</div>
                {gameState === 'playing' && notes.filter(n => n.emotion === emotion && !n.judged).map(note => (
                  <div 
                    key={note.id} 
                    className="note-emoji rising"
                    style={{ animationDuration: `${note.duration}ms` }} // 계산된 속도 적용
                  >
                    {EMOJI_MAP[note.emotion]}
                  </div>
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