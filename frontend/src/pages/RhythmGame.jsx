import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import './RhythmGame.css';

const userId = localStorage.getItem('userId');

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
  
  const [gameState, setGameState] = useState('ready'); 
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [notes, setNotes] = useState([]); 
  const [score, setScore] = useState(0);
  const [judgement, setJudgement] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(new Audio()); 
  const gameLoopRef = useRef(null);
  const noteTimeoutRef = useRef(null);
  const latestExpressionsRef = useRef({});
  const isDetecting = useRef(false);
  const hasUpdatedScore = useRef(false);
  const pauseStartTimeRef = useRef(0);

  // [핵심 추가] 이미 판정된 노트 ID를 추적하는 Ref (리액트 렌더링과 별개로 즉시 반영됨)
  const judgedNotesRef = useRef(new Set());

  const selectedSong = useMemo(() => location.state?.song || { 
    id: 1, title: "기본 곡", artist: "Artist", bpm: 120, difficulty: 2, file_path: "song_30s.mp3" 
  }, [location.state]);

  const settings = useMemo(() => {
    const diff = selectedSong.difficulty;
    const diffLabel = (diff === 1 || diff === 'Easy') ? "EASY" : (diff === 3 || diff === 'Hard') ? "HARD" : "NORMAL";
    let baseTiming = (60000 / 100) * 3; 
    return { 
      hitTiming: baseTiming, 
      spawnRange: (diffLabel === 'HARD' ? [800, 1200] : [1200, 1800]), 
      label: diffLabel 
    };
  }, [selectedSong]);

  const stopAllTimers = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
    gameLoopRef.current = null;
    noteTimeoutRef.current = null;
    audioRef.current.pause();
  }, []);

  const handlePause = useCallback(() => {
    if (gameState !== 'playing') return;
    pauseStartTimeRef.current = Date.now();
    stopAllTimers();
    setGameState('paused');
  }, [gameState, stopAllTimers]);

  const handleResume = useCallback(() => {
    if (gameState !== 'paused') return;
    const pauseDuration = Date.now() - pauseStartTimeRef.current;
    setNotes(prev => prev.map(n => ({
      ...n,
      hitTime: n.hitTime + pauseDuration
    })));
    setGameState('playing');
    audioRef.current.play();
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing') handlePause();
        else if (gameState === 'paused') handleResume();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handlePause, handleResume]);

  useEffect(() => {
    return () => {
      stopAllTimers();
      if (audioRef.current) {
        audioRef.current.src = "";
        audioRef.current.load();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, [stopAllTimers]);

  useEffect(() => {
    if (gameState === 'finished' && !hasUpdatedScore.current) {
      const saveScoreToDB = async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/api/scores/best?user_id=${userId}&song_id=${selectedSong.id}`);
          let prevBest = 0;
          if (response.ok) {
            const data = await response.json();
            prevBest = data.score_value || 0;
          }
          if (score > prevBest) {
            await fetch(`${BACKEND_URL}/api/scores`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: parseInt(userId),
                song_id: selectedSong.id,
                score_value: score
              }),
            });
            setIsNewRecord(true);
          }
        } catch (err) { console.error(err); }
        finally { hasUpdatedScore.current = true; }
      };
      saveScoreToDB();
    }
  }, [gameState, score, selectedSong.id]);

  // 점수 판정 로직 (Perfect 200점 유지)
  const handleJudgement = useCallback((noteEmotion) => {
    const rawProb = latestExpressionsRef.current[noteEmotion] || 0; 
    const config = EMOTION_CONFIG[noteEmotion];
    let res = { text: 'Miss', type: 'miss', add: 0 };

    if (rawProb >= config.perfect) {
      const ratio = (rawProb - config.perfect) / (1 - config.perfect);
      res = { text: 'Perfect!', type: 'perfect', add: 150 + Math.floor(ratio * 50) };
    } else if (rawProb >= config.good) {
      const ratio = (rawProb - config.good) / (config.perfect - config.good);
      res = { text: 'Good!', type: 'good', add: 50 + Math.floor(ratio * 99) };
    }

    setJudgement({ text: res.add > 0 ? `${res.text}` : res.text, type: res.type });
    setScore(p => p + res.add);
    setTimeout(() => setJudgement(null), 500);
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
          // [수정] judged 상태뿐만 아니라 judgedNotesRef를 동시에 확인하여 즉각 중복 방지
          if (!n.judged && now >= n.hitTime && !judgedNotesRef.current.has(n.id)) {
            judgedNotesRef.current.add(n.id); // 즉시 셋에 추가
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
      judgedNotesRef.current.clear(); // [추가] 시작 시 판정 기록 초기화
      setIsNewRecord(false); hasUpdatedScore.current = false;
      setGameState('playing');
      audio.onended = () => { setGameState('finished'); stopAllTimers(); };
    }).catch(err => alert("재생 실패"));
  };

  return (
    <div className="game-container">
      {!isModelLoaded && <div className="loading-overlay">모델 로딩 중...</div>}
      <video ref={videoRef} autoPlay playsInline muted onPlay={() => requestAnimationFrame(detectExpressions)} className="webcam-bg" />
      
      {(gameState === 'playing' || gameState === 'paused') && (
        <>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <button className="game-pause-btn" onClick={handlePause}>
            <span>II</span>
          </button>
        </>
      )}

      {gameState === 'paused' && (
        <div className="overlay-screen pause-screen">
          <h1 className="game-title">PAUSED</h1>
          <div className="button-group horizontal">
            <button className="menu-btn start" onClick={handleResume}>RESUME</button>
            <button className="menu-btn select" onClick={() => navigate('/select')}>QUIT</button>
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="overlay-screen result-screen">
          {isNewRecord && <p className="new-record-badge">NEW RECORD! 🏆</p>}
          <h2 className="result-label">FINAL SCORE</h2>
          <h1 className="final-score-text">{score.toLocaleString()}</h1>
          <div className="button-group horizontal">
            <button className="menu-btn retry" onClick={() => { setGameState('ready'); setProgress(100); }}>RETRY</button>
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
      
      {(gameState !== 'finished') && (
        <div className="lane-container">
          {EMOTIONS.map(em => (
            <div key={em} className={`lane ${em} ${currentEmotion === em ? 'active' : 'inactive'}`}>
              <div className="target-emoji">{EMOJI_MAP[em]}</div>
              <div className="note-stream">
                {notes.filter(n => n.emotion === em && !n.judged).map(n => (
                  <div 
                    key={n.id} 
                    className={`note-emoji rising ${gameState === 'paused' ? 'paused' : ''}`} 
                    style={{ animationDuration: `${settings.hitTiming}ms` }}
                  >
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
          <div className="score-capsule">SCORE: {score.toLocaleString()}</div>
          {judgement && <div className={`judgement-display ${judgement.type}`}>{judgement.text}</div>}
        </div>
      )}
    </div>
  );
};

export default RhythmGame;