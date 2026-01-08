import React, { useState, useEffect, useRef } from 'react';
import Webcam from "react-webcam";
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';

const Tutorial = () => {
  const expressionsList = [
    { key: 'surprised', label: '놀람', emoji: '😲' },
    { key: 'happy', label: '기쁨', emoji: '😊' },
    { key: 'sad', label: '슬픔', emoji: '😢' },
    { key: 'angry', label: '분노', emoji: '😡' },
    { key: 'neutral', label: '무표정', emoji: '😐' }
  ];

  const [target, setTarget] = useState(null);
  const [currentScore, setCurrentScore] = useState(""); 
  const [isFinished, setIsFinished] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  
  const isFinishedRef = useRef(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models'; 
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        const randomIndex = Math.floor(Math.random() * expressionsList.length);
        setTarget(expressionsList[randomIndex]);
        setIsModelLoaded(true);
      } catch (error) {
        console.error("❌ 모델 로드 실패", error);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    let interval;
    if (isModelLoaded && target && !isFinished) {
      interval = setInterval(async () => {
        if (isFinishedRef.current) return;

        if (webcamRef.current && webcamRef.current.video.readyState === 4) {
          const video = webcamRef.current.video;
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          if (isFinishedRef.current || !detections || detections.length === 0) return;

          const prob = detections[0].expressions[target.key];
          const perfectThreshold = target.key === 'neutral' ? 0.95 : 0.8;

          if (prob >= perfectThreshold) {
            isFinishedRef.current = true;
            setIsFinished(true);
            setCurrentScore("Perfect");
            
            console.log("🎯 Perfect 달성! 모든 인식을 중단합니다.");

            setTimeout(() => {
              navigate('/Home');
            }, 5000);

          } else if (!isFinishedRef.current) {
            if (prob >= 0.5) {
              setCurrentScore("Good");
            } else {
              setCurrentScore("MISS");
            }
          }
        }
      }, 50); 
    }
    return () => clearInterval(interval);
  }, [isModelLoaded, isFinished, target, navigate]);

  if (!target) return <div className="bg-black min-h-screen flex items-center justify-center text-white">준비 중...</div>;

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-sans">
      <Webcam audio={false} ref={webcamRef} className="absolute inset-0 w-full h-full object-cover mirror" />

      {/* 상단 헤더 (뒤로 가기 버튼 및 미션 안내) */}
      <header className="absolute top-0 w-full py-8 px-12 z-20 flex items-start gap-6">
        {/* 뒤로 가기 버튼 추가 */}
        <button 
          onClick={() => navigate('/Home')} 
          className="p-3 bg-black/40 backdrop-blur-md border border-white/20 rounded-full hover:bg-black/60 transition-all group"
          aria-label="뒤로 가기"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 text-white group-hover:scale-110 transition-transform" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="inline-block bg-black/50 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/20">
          <p className="text-white text-lg font-bold opacity-80">이번 미션</p>
          <h1 className="text-5xl font-black text-yellow-300 tracking-tighter">
            {target.label} {target.emoji}
          </h1>
        </div>
      </header>

      {/* 중앙 판정 UI */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {currentScore && (
          <h2 className={`text-[15rem] font-black italic drop-shadow-2xl transition-all duration-75
            ${currentScore === 'Perfect' ? 'text-yellow-300 scale-110' : 
              currentScore === 'Good' ? 'text-green-400' : 'text-red-500 scale-90'}`}>
            {currentScore}{currentScore === 'Perfect' ? '!' : currentScore === 'Good' ? '~' : ''}
          </h2>
        )}
      </div>

      {/* 하단 가이드 가시성 향상 */}
      <div className="absolute bottom-16 w-full flex flex-col items-center gap-8">
        <div className={`px-12 py-6 rounded-full shadow-2xl backdrop-blur-xl transition-all duration-500
          ${isFinished ? 'bg-blue-600 text-white border-none' : 'bg-white/95 text-gray-900 border border-gray-200'}`}>
          <p className="text-3xl font-black">
            {isFinished 
              ? "🎉 튜토리얼 완료! 곧 메인으로 이동합니다." 
              : `지금 수치: ${currentScore === "Perfect" ? "만점!" : "더 크게 표현해 보세요!"}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;