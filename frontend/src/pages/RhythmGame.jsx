import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import './RhythmGame.css';

// --- 설정 및 데이터 ---
const SONGS = [{ id: 1, title: "감정 안정화 버전", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }];
const EMOTIONS = ['happy', 'sad', 'angry', 'neutral', 'surprised'];
const EMOJI_MAP = { happy: '😊', sad: '😭', angry: '😡', neutral: '😟', surprised: '😮' };

// [핵심] 가중치 및 감도 설정
const EMOTION_WEIGHTS = {
  happy: 2.2,    // 웃음 인식 대폭 강화
  neutral: 2.0,  // 무표정 안정화
  angry: 1.5,
  surprised: 1.2,
  sad: 0.4       // 슬픔 민감도를 극도로 낮춤 (웃음과의 간섭 방지)
};

const CHANGE_THRESHOLD_DELTA = 0.3; // 감정이 바뀌기 위해 필요한 최소 점수 차이 (안정화 핵심)
const HIT_TIMING_MS = 2780;
const DETECTION_OPTIONS = new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.4 });

const RhythmGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [notes, setNotes] = useState([]);
  const [score, setScore] = useState(0);
  const [judgement, setJudgement] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(new Audio());
  const latestExpressionsRef = useRef({});
  const isDetecting = useRef(false);
  const gameLoopRef = useRef(null);
  const noteTimeoutRef = useRef(null);

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
      } catch (err) {
        console.error("초기화 실패:", err);
      }
    };
    init();
    return () => stopGame();
  }, []);

  // --- 초저지연 및 감정 안정화 감지 루프 ---
  const detectExpressions = useCallback(async () => {
    if (!videoRef.current || videoRef.current.paused || isDetecting.current) return;

    isDetecting.current = true;
    const detections = await faceapi.detectAllFaces(videoRef.current, DETECTION_OPTIONS).withFaceExpressions();

    if (detections.length > 0) {
      const expressions = detections[0].expressions;
      latestExpressionsRef.current = expressions;

      // 현재 감정의 가중 점수 계산
      const currentScore = (expressions[currentEmotion] || 0) * (EMOTION_WEIGHTS[currentEmotion] || 1);

      // 전체 감정 중 가장 높은 가중 점수 찾기
      let bestEmotion = currentEmotion;
      let maxWeightedScore = currentScore;

      Object.keys(expressions).forEach(emotion => {
        if (!EMOTIONS.includes(emotion)) return;
        const weightedScore = expressions[emotion] * (EMOTION_WEIGHTS[emotion] || 1);
        
        // [안정화 로직] 새로운 감정이 현재 감정보다 확실히(Delta 만큼) 높을 때만 교체
        if (weightedScore > maxWeightedScore + CHANGE_THRESHOLD_DELTA) {
          maxWeightedScore = weightedScore;
          bestEmotion = emotion;
        }
      });

      if (currentEmotion !== bestEmotion) {
        setCurrentEmotion(bestEmotion);
      }
    }
    isDetecting.current = false;
    requestAnimationFrame(detectExpressions);
  }, [currentEmotion]);

  const handleVideoPlay = () => requestAnimationFrame(detectExpressions);

  const judgeNote = useCallback((noteEmotion) => {
    const rawScore = latestExpressionsRef.current[noteEmotion] || 0;
    
    // 판정 시 감정별 난이도 보정
    let bonus = 1.0;
    if (noteEmotion === 'neutral') bonus = 1.2;
    if (noteEmotion === 'happy') bonus = 1.1;

    const percentage = Math.min(100, Math.round(rawScore * 100 * bonus));
    
    let res = { text: 'Miss', type: 'miss', add: 0 };
    if (percentage >= 70) res = { text: 'Perfect!', type: 'perfect', add: Math.round(percentage * 1.2) };
    else if (percentage >= 40) res = { text: 'Good!', type: 'good', add: percentage };

    setScore(prev => prev + res.add);
    setJudgement({ text: res.text, type: res.type });
    setTimeout(() => setJudgement(null), 400);
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
    
    // 노트 간 텀 유지 (2~4초)
    const nextDelay = Math.random() * 2000 + 2000; 
    noteTimeoutRef.current = setTimeout(scheduleNextNote, nextDelay);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    audioRef.current.src = SONGS[0].url;
    audioRef.current.play();
    startGameLoop();
    scheduleNextNote();
    audioRef.current.onended = () => { stopGame(); setGameState('finished'); };
  };

  const stopGame = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
    audioRef.current.pause();
  };

  return (
    <div className="game-container">
      {!isModelLoaded && <div className="loading-overlay">감정 필터링 최적화 중...</div>}
      <video ref={videoRef} autoPlay playsInline muted onPlay={handleVideoPlay} className="webcam-bg" />

      {gameState !== 'playing' && isModelLoaded && (
        <div className="overlay-screen">
          <h1 className="game-title">{gameState === 'ready' ? 'Emotion Rhythm' : 'Result'}</h1>
          {gameState === 'finished' && <h2 className="final-score">Score: {score}</h2>}
          <button className="start-btn" onClick={gameState === 'ready' ? startGame : () => setGameState('ready')}>
            {gameState === 'ready' ? 'GAME START' : 'RETRY'}
          </button>
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
          <div className="score-display">Score: {score}</div>
        </>
      )}
    </div>
  );
};

export default RhythmGame;