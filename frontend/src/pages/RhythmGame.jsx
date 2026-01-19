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

const RhythmGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. 상태 관리
  const [gameState, setGameState] = useState('ready'); // ready, playing, paused, finished
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [notes, setNotes] = useState([]); 
  const [score, setScore] = useState(0);
  const [judgement, setJudgement] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [progress, setProgress] = useState(100);

  // 2. 타이머 및 외부 객체 관리
  const videoRef = useRef(null);
  const audioRef = useRef(new Audio()); 
  const gameLoopRef = useRef(null);
  const noteTimeoutRef = useRef(null);
  const endTimerRef = useRef(null);
  const latestExpressionsRef = useRef({});
  const isDetecting = useRef(false);

  // 3. 노래 데이터 처리
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
  }, []);

  const spawnNote = useCallback(() => {
    // 일시정지 상태면 노트를 생성하지 않음
    if (gameState !== 'playing') return;

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
  }, [gameState, settings]);

  // 5. 초기 모델 초기화
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
      let maxScore = -1;
      EMOTIONS.forEach(em => {
        const weighted = (expressions[em] || 0) * EMOTION_CONFIG[em].weight;
        if (weighted > maxScore) { maxScore = weighted; bestEmotion = em; }
      });
      setCurrentEmotion(bestEmotion); 
    }
    isDetecting.current = false;
    requestAnimationFrame(detectExpressions);
  }, []);

  // 7. 게임 엔진 제어 (일시정지 로직 통합)
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(() => {
        const now = Date.now();
        
        if (audioRef.current.duration) {
          const currentProgress = ((audioRef.current.duration - audioRef.current.currentTime) / audioRef.current.duration) * 100;
          setProgress(Math.max(0, currentProgress));
        }

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
      // playing 상태가 아니면 타이머 제거 (일시정지 포함)
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
    };
  }, [gameState, spawnNote, stopAllTimers]);

  // 8. 제어 함수들
  const startGame = () => {
    const audio = audioRef.current;
    const cleanPath = selectedSong.file_path.startsWith('/') ? selectedSong.file_path.substring(1) : selectedSong.file_path;
    audio.src = `${BACKEND_URL}/${cleanPath}`;
    audio.crossOrigin = "anonymous";

    audio.play().then(() => {
      setNotes([]);
      setScore(0);
      setGameState('playing');
      audio.onended = () => { setGameState('finished'); stopAllTimers(); };
    }).catch(err => { alert("오디오 재생 실패"); });
  };

  const pauseGame = () => {
    if (gameState !== 'playing') return;
    setGameState('paused');
    audioRef.current.pause(); // 음악 중지
  };

  const resumeGame = () => {
    if (gameState !== 'paused') return;
    audioRef.current.play().then(() => {
      setGameState('playing'); // 엔진 자동 재시작
    });
  };

  const restartGame = () => {
    stopAllTimers();
    startGame();
  };

  const goToSongSelection = () => {
    stopAllTimers();
    navigate('/select'); // 노래 선택 페이지 경로에 맞게 수정
  };

  return (
    <div className="game-container">
      {!isModelLoaded && <div className="loading-overlay">모델 로딩 중...</div>}
      <video ref={videoRef} autoPlay playsInline muted onPlay={() => requestAnimationFrame(detectExpressions)} className="webcam-bg" />
      
      {/* 상단 시간바 */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {/* 게임 대기 화면 */}
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

      {/* [신규] 일시정지 오버레이 메뉴 */}
      {gameState === 'paused' && (
        <div className="overlay-screen pause-menu">
          <h1 className="menu-title">PAUSED</h1>
          <div className="button-group">
            <button className="menu-btn resume" onClick={resumeGame}>이어서 하기</button>
            <button className="menu-btn restart" onClick={restartGame}>다시 하기</button>
            <button className="menu-btn select" onClick={goToSongSelection}>곡 선택하러 가기</button>
          </div>
        </div>
      )}

      {/* 결과 화면 */}
      {gameState === 'finished' && (
        <div className="overlay-screen result-screen">
          <h1 className="final-score-text">{score}</h1>
          <button className="menu-btn retry" onClick={() => setGameState('ready')}>RETRY</button>
        </div>
      )}

      {/* 인게임 요소 */}
      {(gameState === 'playing' || gameState === 'paused' || gameState === 'ready') && (
        <>
          {gameState === 'playing' && (
            <button className="pause-icon-btn" onClick={pauseGame}>❚❚</button>
          )}
          
          <div className="lane-container">
            {EMOTIONS.map((emotion) => (
              <div key={emotion} className={`lane ${emotion} ${currentEmotion === emotion ? 'active' : 'inactive'}`}>
                <div className="target-emoji">{EMOJI_MAP[emotion]}</div>
                <div className="note-stream">
                  {notes.filter(n => n.emotion === emotion && !n.judged).map(note => (
                    <div 
                      key={note.id} 
                      className={`note-emoji rising ${gameState === 'paused' ? 'paused' : ''}`} 
                      style={{ animationDuration: `${settings.hitTiming}ms` }}
                    >
                      {EMOJI_MAP[note.emotion]}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
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