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
    title: "기본 곡", artist: "Artist", bpm: 120, difficulty: 2, file_path: "song_30s.mp3" 
  }, [location.state]);

  const settings = useMemo(() => {
    const bpm = selectedSong.bpm || 120;
    const diffLabel = (selectedSong.difficulty === 1 || selectedSong.difficulty === 'Easy') ? "EASY" : 
                      (selectedSong.difficulty === 3 || selectedSong.difficulty === 'Hard') ? "HARD" : "NORMAL";
    let baseTiming = (60000 / bpm) * 4; 
    const config = { 'EASY': 1.5, 'NORMAL': 1.0, 'HARD': 0.7 }[diffLabel];
    const spawn = { 'EASY': [2000, 3000], 'NORMAL': [1000, 2000], 'HARD': [600, 1200] }[diffLabel];
    return { hitTiming: baseTiming * config, spawnRange: spawn, label: diffLabel };
  }, [selectedSong]);

  const [gameState, setGameState] = useState('ready'); 
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [notes, setNotes] = useState([]); 
  const [score, setScore] = useState(0);
  const [judgement, setJudgement] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null); // JSX의 <audio> 태그 참조
  const isDetecting = useRef(false);
  const latestExpressionsRef = useRef({});
  const gameLoopRef = useRef(null);
  const noteTimeoutRef = useRef(null);
  const endTimerRef = useRef(null);
  const gameStateRef = useRef('ready');

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // 1. 모델 초기화
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
      } catch (err) { console.error("Init Error:", err); }
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

  const stopGame = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
    if (endTimerRef.current) clearTimeout(endTimerRef.current);
    gameLoopRef.current = null;
    noteTimeoutRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // 2. 노트 생성 로직 (단일 루프 보장)
  const scheduleNextNote = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    const randomEm = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    const now = Date.now();
    setNotes(prev => [...prev, { 
      id: `${now}-${Math.random()}`, emotion: randomEm, hitTime: now + settings.hitTiming, judged: false 
    }]);
    const nextDelay = Math.random() * (settings.spawnRange[1] - settings.spawnRange[0]) + settings.spawnRange[0];
    noteTimeoutRef.current = setTimeout(scheduleNextNote, nextDelay); 
  }, [settings]);

  // 3. 게임 루프 (중복 방지를 위해 cleanup 철저히 수행)
  useEffect(() => {
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
      scheduleNextNote();
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
    };
  }, [gameState, scheduleNextNote]);

  // ★ [해결 포인트] 자동 재생 차단을 뚫기 위한 동기 재생 함수
  const startGame = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // 1. 클릭하자마자 바로 재생 명령 (브라우저 정책 통과 핵심)
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // 2. 재생이 확실히 시작되면 그 때 리액트 상태를 'playing'으로 변경
          console.log("재생 성공 - 게임 시작");
          setNotes([]);
          setScore(0);
          setGameState('playing');

          audio.onended = () => {
            setGameState('finished');
            stopGame();
          };

          if (endTimerRef.current) clearTimeout(endTimerRef.current);
          endTimerRef.current = setTimeout(() => {
            setGameState('finished');
            stopGame();
          }, GAME_LIMIT_MS);
        })
        .catch((err) => {
          console.error("재생 차단됨:", err);
          alert("재생이 차단되었습니다. 다시 클릭해주세요.");
        });
    }
  };

  const songSrc = useMemo(() => {
    const rawPath = selectedSong.file_path || "song_30s.mp3";
    const cleanPath = rawPath.startsWith('/') ? rawPath.substring(1) : rawPath;
    return `${BACKEND_URL}/${cleanPath}`;
  }, [selectedSong]);

  return (
    <div className="game-container">
      {/* 4. 표준 audio 태그와 CORS 설정 */}
      <audio 
        ref={audioRef} 
        src={songSrc} 
        preload="auto" 
        crossOrigin="anonymous" 
      />

      {!isModelLoaded && <div className="loading-overlay">감정 엔진 보정 중...</div>}
      <video ref={videoRef} autoPlay playsInline muted onPlay={() => requestAnimationFrame(detectExpressions)} className="webcam-bg" />
      
      {gameState === 'ready' && (
        <div className="overlay-screen">
          <h1 className="game-title">Emotion Rhythm</h1>
          <div className="song-detail-box">
             <p className="song-title-text">{selectedSong.title}</p>
             <p className="song-sub-text">{selectedSong.artist} | {settings.label}</p>
          </div>
          <button className="menu-btn start" onClick={startGame}>게임 시작</button>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="overlay-screen result-screen">
          <h2 className="result-label">FINAL SCORE</h2>
          <h1 className="final-score-text">{score}</h1>
          <button className="menu-btn retry" onClick={() => setGameState('ready')}>다시 하기</button>
          <button className="menu-btn home" onClick={() => navigate('/Home')}>메인으로</button>
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