import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import './RhythmGame.css';
const userId = localStorage.getItem('userId');
// 감정 설정 (변경 없음)
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

const RhythmGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. 상태 관리 (combo, maxCombo, grade 관련 삭제)
  const [gameState, setGameState] = useState('ready'); 
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [notes, setNotes] = useState([]); 
  const [score, setScore] = useState(0);
  const [judgement, setJudgement] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // 2. Ref 관리
  const videoRef = useRef(null);
  const audioRef = useRef(new Audio()); 
  const gameLoopRef = useRef(null);
  const noteTimeoutRef = useRef(null);
  const latestExpressionsRef = useRef({});
  const isDetecting = useRef(false);
  const hasUpdatedScore = useRef(false);

  // 3. 노래 데이터 처리
  const selectedSong = useMemo(() => location.state?.song || { 
    id: 1, title: "기본 곡", artist: "Artist", bpm: 120, difficulty: 2, file_path: "song_30s.mp3" 
  }, [location.state]);

  const settings = useMemo(() => {
    const bpm = selectedSong.bpm || 120;
    const diff = selectedSong.difficulty;
    const diffLabel = (diff === 1 || diff === 'Easy') ? "EASY" : (diff === 3 || diff === 'Hard') ? "HARD" : "NORMAL";
    let baseTiming = (60000 / 100) * 3; 
    return { 
      hitTiming: baseTiming, 
      spawnRange: (diffLabel === 'HARD' ? [500, 1000] : [1000, 1500]), 
      label: diffLabel 
    };
  }, [selectedSong]);

  // --- [수정] DB 저장 로직: combo와 grade 제외 ---
  useEffect(() => {
    if (gameState === 'finished' && !hasUpdatedScore.current) {
      const userId = localStorage.getItem('userId'); 
      if (!userId) return;

      const saveScoreToDB = async () => {
        try {
          // 1. 기존 최고 점수 확인 (score_value만 비교)
          const response = await fetch(`${BACKEND_URL}/api/scores/best?user_id=${userId}&song_id=${selectedSong.id}`);
          let prevBest = 0;
          if (response.ok) {
            const data = await response.json();
            prevBest = data.score_value || 0;
          }

          // 2. 현재 점수가 기록 경신일 때만 핵심 데이터(3개) 전송
          if (score > prevBest) {
            await fetch(`${BACKEND_URL}/api/scores`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: parseInt(userId),      // BIGINT
                song_id: selectedSong.id,       // BIGINT
                score_value: score              // INT
              }),
            });
            setIsNewRecord(true);
          }
        } catch (err) {
          console.error("DB 저장 에러:", err);
        } finally {
          hasUpdatedScore.current = true;
        }
      };
      saveScoreToDB();
    }
  }, [gameState, score, selectedSong.id]);

  // 4. 게임 엔진 (판정 로직에서 콤보 삭제)
  const handleJudgement = useCallback((noteEmotion) => {
    const rawProb = latestExpressionsRef.current[noteEmotion] || 0;
    const config = EMOTION_CONFIG[noteEmotion];
    
    let res = { text: 'Miss', type: 'miss', add: 0 };
    
    if (rawProb >= config.perfect) {
      res = { text: 'Perfect!', type: 'perfect', add: 100 };
    } else if (rawProb >= config.good) {
      res = { text: 'Good!', type: 'good', add: 50 };
    }

    setJudgement({ text: res.text, type: res.type });
    setScore(p => p + res.add);
    setTimeout(() => setJudgement(null), 500);
  }, []);

  // 5. 유틸리티 및 초기화 (이전과 동일)
  const stopAllTimers = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
    gameLoopRef.current = null;
    noteTimeoutRef.current = null;
    audioRef.current.pause();
  }, []);

  const spawnNote = useCallback(() => {
    if (gameState !== 'playing') return;
    const randomEm = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    const now = Date.now();
    setNotes(prev => [...prev, { 
      id: `${now}-${Math.random()}`, emotion: randomEm, hitTime: now + settings.hitTiming, judged: false 
    }]);
    const nextDelay = Math.random() * (settings.spawnRange[1] - settings.spawnRange[0]) + settings.spawnRange[0];
    noteTimeoutRef.current = setTimeout(spawnNote, nextDelay);
  }, [gameState, settings]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(() => {
        const now = Date.now();
        if (audioRef.current.duration) {
          const cp = ((audioRef.current.duration - audioRef.current.currentTime) / audioRef.current.duration) * 100;
          setProgress(Math.max(0, cp));
        }
        setNotes(prev => prev.map(n => {
          if (!n.judged && now >= n.hitTime) {
            handleJudgement(n.emotion);
            return { ...n, judged: true };
          }
          return n;
        }).filter(n => now < n.hitTime + 1000));
      }, 16);
      spawnNote();
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
    };
  }, [gameState, spawnNote, handleJudgement]);

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        setIsModelLoaded(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { console.error(err); }
    };
    init();
  }, []);

  const detectExpressions = useCallback(async () => {
    if (!videoRef.current || videoRef.current.paused || isDetecting.current) return;
    isDetecting.current = true;
    const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 })).withFaceExpressions();
    if (detections.length > 0) {
      const expressions = detections[0].expressions;
      latestExpressionsRef.current = expressions;
      let bestEmotion = 'neutral';
      let maxS = -1;
      EMOTIONS.forEach(em => {
        const w = (expressions[em] || 0) * EMOTION_CONFIG[em].weight;
        if (w > maxS) { maxS = w; bestEmotion = em; }
      });
      setCurrentEmotion(bestEmotion); 
    }
    isDetecting.current = false;
    requestAnimationFrame(detectExpressions);
  }, []);

  const startGame = () => {
    const audio = audioRef.current;
    const cleanPath = selectedSong.file_path.startsWith('/') ? selectedSong.file_path.substring(1) : selectedSong.file_path;
    audio.src = `${BACKEND_URL}/${cleanPath}`;
    audio.crossOrigin = "anonymous";
    audio.play().then(() => {
      setNotes([]); setScore(0);
      setIsNewRecord(false); hasUpdatedScore.current = false;
      setGameState('playing');
      audio.onended = () => { setGameState('finished'); stopAllTimers(); };
    }).catch(err => alert("재생 실패"));
  };

  return (
    <div className="game-container">
      {!isModelLoaded && <div className="loading-overlay">모델 로딩 중...</div>}
      <video ref={videoRef} autoPlay playsInline muted onPlay={() => requestAnimationFrame(detectExpressions)} className="webcam-bg" />
      
      {gameState === 'playing' && (
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {/* 결과 화면 (콤보/등급 삭제) */}
      {gameState === 'finished' && (
        <div className="overlay-screen result-screen">
          {isNewRecord && <p className="new-record-badge">NEW RECORD! 🏆</p>}
          <h2 className="result-label">FINAL SCORE</h2>
          <h1 className="final-score-text">{score}</h1>
          <div className="button-group horizontal">
            <button className="menu-btn retry" onClick={() => setGameState('ready')}>RETRY</button>
            <button className="menu-btn select" onClick={() => navigate('/select')}>곡 선택</button>
          </div>
        </div>
      )}

      {gameState === 'ready' && (
        <div className="overlay-screen">
          <h1 className="game-title">Emotion Rhythm</h1>
          <button className="menu-btn start" onClick={startGame}>START</button>
        </div>
      )}
      
      {(gameState === 'playing' || gameState === 'ready') && (
        <div className="lane-container">
          {EMOTIONS.map(em => (
            <div key={em} className={`lane ${em} ${currentEmotion === em ? 'active' : 'inactive'}`}>
              <div className="target-emoji">{EMOJI_MAP[em]}</div>
              <div className="note-stream">
                {notes.filter(n => n.emotion === em && !n.judged).map(n => (
                  <div key={n.id} className="note-emoji rising" style={{ animationDuration: `${settings.hitTiming}ms` }}>
                    {EMOJI_MAP[n.emotion]}
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