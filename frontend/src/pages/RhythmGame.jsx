import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import './RhythmGame.css';

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
  
  const selectedSong = useMemo(() => location.state?.song || { 
    title: "기본 곡", artist: "Artist", bpm: 120, difficulty: 2, file_path: "" 
  }, [location.state]);

  const settings = useMemo(() => {
    const bpm = selectedSong.bpm || 120;
    const diff = selectedSong.difficulty;
    const diffLabel = (diff === 1 || diff === 'Easy') ? "EASY" : (diff === 3 || diff === 'Hard') ? "HARD" : "NORMAL";
    let baseTiming = (60000 / bpm) * 3; 
    const config = {
      'EASY':   { speed: 1.5, spawn: [1000, 1500] },
      'NORMAL': { speed: 1.0, spawn: [800, 1000] }, 
      'HARD':   { speed: 0.8, spawn: [500, 800] } 
    }[diffLabel];
    return { hitTiming: baseTiming * config.speed, spawnRange: config.spawn };
  }, [selectedSong]);

  const [gameState, setGameState] = useState('ready'); 
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [notes, setNotes] = useState([]); 
  const [score, setScore] = useState(0);
  const [judgement, setJudgement] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(new Audio());
  const audioPromiseRef = useRef(null); 
  const latestExpressionsRef = useRef({});
  const isDetecting = useRef(false);
  
  const gameLoopRef = useRef(null);
  const endTimerRef = useRef(null);
  const lastSpawnTimeRef = useRef(0);
  const nextSpawnDelayRef = useRef(1000);

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
      } catch (err) { console.error("모델 로딩 실패:", err); }
    };
    init();
    return () => stopGame();
  }, []);

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

  const performJudge = useCallback((noteEmotion) => {
    const rawProb = latestExpressionsRef.current[noteEmotion] || 0;
    const config = EMOTION_CONFIG[noteEmotion];
    let res = { text: 'Miss', type: 'miss', add: 0 };
    if (rawProb >= config.perfect) res = { text: 'Perfect!', type: 'perfect', add: 100 };
    else if (rawProb >= config.good) res = { text: 'Good!', type: 'good', add: 50 };
    setScore(prev => prev + res.add);
    setJudgement({ text: res.text, type: res.type });
    setTimeout(() => setJudgement(null), 500);
  }, []);

  const stopGame = useCallback(async () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (endTimerRef.current) clearTimeout(endTimerRef.current);
    gameLoopRef.current = null;

    const audio = audioRef.current;
    if (audioPromiseRef.current) {
      try {
        await audioPromiseRef.current;
        audio.pause();
        audio.currentTime = 0;
      } catch (e) { } finally { audioPromiseRef.current = null; }
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      lastSpawnTimeRef.current = Date.now();
      nextSpawnDelayRef.current = settings.spawnRange[0];

      gameLoopRef.current = setInterval(() => {
        const now = Date.now();

        setNotes(prevNotes => {
          let updated = [...prevNotes];

          if (now - lastSpawnTimeRef.current >= nextSpawnDelayRef.current) {
            const randomEm = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
            const uniqueId = window.crypto?.randomUUID ? crypto.randomUUID() : `n-${now}-${Math.random()}`;

            updated.push({
              id: uniqueId,
              emotion: randomEm,
              hitTime: now + settings.hitTiming,
              judged: false
            });

            lastSpawnTimeRef.current = now;
            nextSpawnDelayRef.current = Math.random() * (settings.spawnRange[1] - settings.spawnRange[0]) + settings.spawnRange[0];
          }

          return updated.map(n => {
            if (!n.judged && now >= n.hitTime) {
              performJudge(n.emotion);
              return { ...n, judged: true };
            }
            return n;
          }).filter(n => now < n.hitTime + 2000); 
        });
      }, 16);
    } else {
      stopGame();
    }
    return () => stopGame();
  }, [gameState, settings, performJudge, stopGame]);

  // [확인 완료] 노래와 게임 시작을 완벽히 동기화한 함수
  const startGame = async () => {
    if (!selectedSong.file_path) {
      alert("노래 파일 경로가 없습니다.");
      return;
    }

    setNotes([]);
    setScore(0);
    setJudgement(null);


    const songUrl = selectedSong.file_path.startsWith('http') 
      ? selectedSong.file_path 
      : `${BACKEND_URL}${selectedSong.file_path.startsWith('/') ? '' : '/'}${selectedSong.file_path}`;

    const audio = audioRef.current;
    audio.src = songUrl;
    audio.volume = 1.0;
    
    try {
      console.log("🎵 오디오 로드 및 재생 시도 중...");
      audioPromiseRef.current = audio.play(); // 1. 먼저 재생을 시도함
      
      if (audioPromiseRef.current !== undefined) {
        await audioPromiseRef.current; // 2. 재생이 실제로 시작될 때까지 기다림
        console.log("✅ 재생 성공! 게임 시작.");
        setGameState('playing'); // 3. 그 직후 게임 화면 활성화
      }
    } catch (error) {
      console.error("❌ 오디오 재생 실패:", error);
      alert(`음악을 재생할 수 없습니다. 서버 상태나 파일 경로를 확인하세요: ${songUrl}`);
      return;
    }

    if (endTimerRef.current) clearTimeout(endTimerRef.current);
    endTimerRef.current = setTimeout(() => {
      setGameState('finished');
      stopGame();
    }, GAME_LIMIT_MS);
  };

  return (
    <div className="game-container">
      {!isModelLoaded && <div className="loading-overlay">모델 로딩 중...</div>}
      <video ref={videoRef} autoPlay playsInline muted onPlay={() => requestAnimationFrame(detectExpressions)} className="webcam-bg" />
      
      {gameState === 'playing' && <div className="time-limit-bar" />}

      {gameState === 'ready' && (
        <div className="overlay-screen">
          <h1 className="game-title">Emotion Rhythm</h1>
          <div className="song-detail-box">
             <p className="song-title-text">{selectedSong.title}</p>
             <p className="song-sub-text">{selectedSong.artist} | BPM: {selectedSong.bpm}</p>
          </div>
          <button className="menu-btn start" onClick={startGame}>게임 시작</button>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="overlay-screen result-screen">
          <h1 className="final-score-text">{score}</h1>
          <p className="result-label">FINAL SCORE</p>
          <div className="btn-group">
            <button className="menu-btn retry" onClick={() => setGameState('ready')}>다시 하기</button>
            <button className="menu-btn home" onClick={() => navigate('/Home')}>메인으로</button>
          </div>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'ready') && (
        <div className="lane-container">
          {EMOTIONS.map((emotion) => (
            <div key={emotion} className={`lane ${emotion} ${currentEmotion === emotion ? 'active' : 'inactive'}`}>
              <div className="target-emoji">{EMOJI_MAP[emotion]}</div>
              <div className="note-stream">
                {notes.filter(n => n.emotion === emotion).map(note => (
                  <div 
                    key={note.id} 
                    className={`note-emoji rising ${note.judged ? 'judged' : ''}`}
                    style={{ animationDuration: `${settings.hitTiming}ms` }}
                  >
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