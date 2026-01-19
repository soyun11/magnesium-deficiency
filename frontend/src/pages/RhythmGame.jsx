import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import './RhythmGame.css';

// 설정 상수
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
const GAME_LIMIT_MS = 30000; 

const RhythmGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. 상태 관리
  const [gameState, setGameState] = useState('ready'); 
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [notes, setNotes] = useState([]); 
  const [score, setScore] = useState(0);
  const [judgement, setJudgement] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // 2. 타이머 및 외부 객체 관리 (Ref 사용으로 리렌더링 방지)
  const videoRef = useRef(null);
  const audioRef = useRef(new Audio()); 
  const gameLoopRef = useRef(null);
  const noteTimeoutRef = useRef(null);
  const endTimerRef = useRef(null);
  const latestExpressionsRef = useRef({});
  const isDetecting = useRef(false);

  // 3. 노래 데이터 처리 (Memoization)
  const selectedSong = useMemo(() => location.state?.song || { 
    title: "기본 곡", artist: "Artist", bpm: 120, difficulty: 2, file_path: "song_30s.mp3" 
  }, [location.state]);

  const settings = useMemo(() => {
    const bpm = selectedSong.bpm || 120;
    const diff = selectedSong.difficulty;
    const diffLabel = (diff === 1 || diff === 'Easy') ? "EASY" : (diff === 3 || diff === 'Hard') ? "HARD" : "NORMAL";
    let baseTiming = (60000 / bpm) * 4; 
    const config = { 'EASY': 1.5, 'NORMAL': 1.0, 'HARD': 0.7 }[diffLabel];
    return { hitTiming: baseTiming * config, spawnRange: [1000, 2000] };
  }, [selectedSong]);

  // 4. 기능 함수들
  const stopAllTimers = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
    if (endTimerRef.current) clearTimeout(endTimerRef.current);
    gameLoopRef.current = null;
    noteTimeoutRef.current = null;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, []);

  const spawnNote = useCallback(() => {
    // 타이머 콜백 안에서 최신 상태를 알 수 없으므로 Ref나 Functional Update 사용
    const randomEm = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    const now = Date.now();
    
    setNotes(prev => [...prev, { 
      id: `${now}-${Math.random()}`, 
      emotion: randomEm, 
      hitTime: now + settings.hitTiming, 
      judged: false 
    }]);

    const nextDelay = Math.random() * (settings.spawnRange[1] - settings.spawnRange[0]) + settings.spawnRange[0];
    noteTimeoutRef.current = setTimeout(spawnNote, nextDelay);
  }, [settings]);

  // 5. 초기 초기화 (한 번만 실행)
  useEffect(() => {
    const initFaceApi = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        setIsModelLoaded(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { console.error("Init Error:", err); }
    };
    initFaceApi();
    return () => stopAllTimers();
  }, [stopAllTimers]);

  // 6. 감정 감지 루프
  const detectExpressions = useCallback(async () => {
    if (!videoRef.current || videoRef.current.paused || isDetecting.current) return;
    isDetecting.current = true;
    const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 })).withFaceExpressions();
    if (detections.length > 0) {
      const expressions = detections[0].expressions;
      latestExpressionsRef.current = expressions;
      let bestEmotion = 'neutral';
      let maxVal = -1;
      EMOTIONS.forEach(em => {
        const weighted = (expressions[em] || 0) * EMOTION_CONFIG[em].weight;
        if (weighted > maxVal) { maxVal = weighted; bestEmotion = em; }
      });
      setCurrentEmotion(bestEmotion); 
    }
    isDetecting.current = false;
    requestAnimationFrame(detectExpressions);
  }, []);

  // 7. 게임 엔진 (오류의 주범이었던 부분 수정)
  useEffect(() => {
    // 의존성 배열의 크기를 항상 1([gameState])로 고정
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(() => {
        const now = Date.now();
        setNotes(prev => prev.map(note => {
          if (!note.judged && now >= note.hitTime) {
            const rawProb = latestExpressionsRef.current[note.emotion] || 0;
            const config = EMOTION_CONFIG[note.emotion];
            let res = { text: 'Miss', type: 'miss', add: 0 };
            if (rawProb >= config.perfect) res = { text: 'Perfect!', type: 'perfect', add: 100 };
            else if (rawProb >= config.good) res = { text: 'Good!', type: 'good', add: 50 };
            setScore(p => p + res.add);
            setJudgement({ text: res.text, type: res.type });
            setTimeout(() => setJudgement(null), 500);
            return { ...note, judged: true };
          }
          return note;
        }).filter(note => now < note.hitTime + 1000));
      }, 16);
      spawnNote();
    } else {
      stopAllTimers();
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
    };
  }, [gameState, spawnNote, stopAllTimers]);

  // 8. 게임 시작 함수 (사용자 클릭 직결)
  const startGame = () => {
    const audio = audioRef.current;
    const cleanPath = selectedSong.file_path.startsWith('/') ? selectedSong.file_path.substring(1) : selectedSong.file_path;
    audio.src = `${BACKEND_URL}/${cleanPath}`;
    audio.crossOrigin = "anonymous";

    // 클릭 이벤트 '즉시' 실행하여 브라우저 차단 우회
    audio.play()
      .then(() => {
        setNotes([]);
        setScore(0);
        setGameState('playing');
        audio.onended = () => setGameState('finished');
        endTimerRef.current = setTimeout(() => setGameState('finished'), GAME_LIMIT_MS);
      })
      .catch(err => {
        console.error("Play Error:", err);
        alert("오디오 재생 실패. 다시 시도해주세요.");
      });
  };

  return (
    <div className="game-container">
      {!isModelLoaded && <div className="loading-overlay">모델 로딩 중...</div>}
      <video ref={videoRef} autoPlay playsInline muted onPlay={() => requestAnimationFrame(detectExpressions)} className="webcam-bg" />
      
      {gameState === 'ready' && (
        <div className="overlay-screen">
          <h1 className="game-title">Emotion Rhythm</h1>
          <div className="song-detail-box">
             <p className="song-title-text">{selectedSong.title}</p>
             <p className="song-sub-text">{selectedSong.artist}</p>
          </div>
          <button className="menu-btn start" onClick={startGame}>START</button>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="overlay-screen result-screen">
          <h1 className="final-score-text">{score}</h1>
          <button className="menu-btn retry" onClick={() => setGameState('ready')}>RETRY</button>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'ready') && (
        <div className="lane-container">
          {EMOTIONS.map((emotion) => (
            <div key={emotion} className={`lane ${emotion} ${currentEmotion === emotion ? 'active' : 'inactive'}`}>
              <div className="target-emoji">{EMOJI_MAP[emotion]}</div>
              <div className="note-stream">
                {notes.filter(n => n.emotion === emotion && !n.judged).map(note => (
                  <div key={note.id} className="note-emoji rising" style={{ animationDuration: `${settings.hitTiming}ms` }}>
                    {EMOJI_MAP[note.emotion]}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {gameState === 'playing' && (
        <div className="ui-layer">
          <div className="score-capsule">SCORE: {score}</div>
          {judgement && <div className={`judgement-display ${judgement.type}`}>{judgement.text}</div>}
        </div>
      )}
    </div>
  );
};

export default RhythmGame;