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

  const [target, setTarget] = useState(null); // 목표 표정 (초기값 null)
  const [currentScore, setCurrentScore] = useState(""); 
  const [isFinished, setIsFinished] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  // 1. 모델 로딩 및 초기 타겟 설정
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models'; 
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        
        // 튜토리얼 시작 시 딱 한 번만 랜덤 표정 선택
        const randomIndex = Math.floor(Math.random() * expressionsList.length);
        setTarget(expressionsList[randomIndex]);
        
        setIsModelLoaded(true);
        console.log("✅ 모델 로드 성공");
      } catch (error) {
        console.error("❌ 모델 로드 실패", error);
      }
    };
    loadModels();
  }, []);

  // 2. 실시간 판정 루프 (50ms)
  useEffect(() => {
    let interval;
    // Perfect를 달성하기 전까지는 절대로 루프를 멈추지 않음
    if (isModelLoaded && target && !isFinished) {
      interval = setInterval(async () => {
        if (webcamRef.current && webcamRef.current.video.readyState === 4) {
          const video = webcamRef.current.video;
          
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          if (detections && detections.length > 0) {
            const prob = detections[0].expressions[target.key];

            // 판정 로직
            if (prob >= 0.8) {
              setCurrentScore("Perfect");
              setIsFinished(true); // 오직 Perfect일 때만 종료 상태로 전환
              
              // 3초 뒤 메인 화면으로 이동
              setTimeout(() => {
                navigate('/Home');
              }, 5000);

            } else if (prob >= 0.5) {
              setCurrentScore("Good");
              // Good일 때는 계속 루프 진행 (다음 표정으로 안 넘어감)
            } else {
              setCurrentScore("MISS");
              // MISS일 때는 계속 루프 진행 (다음 표정으로 안 넘어감)
            }
          }
        }
      }, 50); 
    }
    return () => clearInterval(interval);
  }, [isModelLoaded, isFinished, target, navigate]);

  if (!target) return <div className="bg-black min-h-screen flex items-center justify-center text-white">준비 중...</div>;

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <Webcam audio={false} ref={webcamRef} className="absolute inset-0 w-full h-full object-cover" />

      {/* 상단 미션 안내 */}
      <header className="absolute top-0 w-full py-8 px-12 z-10">
        <div className="inline-block bg-black/50 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/20">
          <p className="text-white text-lg font-bold opacity-80">이번 미션</p>
          <h1 className="text-5xl font-black text-yellow-300 tracking-tighter">
            {target.label} {target.emoji}
          </h1>
        </div>
      </header>

      {/* 중앙 실시간 판정 (MISS/Good/Perfect) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {currentScore && (
          <h2 className={`text-[18rem] font-black italic drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)] transition-all duration-75
            ${currentScore === 'Perfect' ? 'text-yellow-300 scale-110' : 
              currentScore === 'Good' ? 'text-green-400' : 'text-red-500 scale-90'}`}>
            {currentScore}{currentScore === 'Perfect' ? '!' : currentScore === 'Good' ? '~' : ''}
          </h2>
        )}
      </div>

      {/* 하단 메시지 및 가이드 */}
      <div className="absolute bottom-16 w-full flex flex-col items-center gap-8">
        <div className={`px-12 py-6 rounded-full shadow-2xl backdrop-blur-xl transition-all duration-500
          ${isFinished ? 'bg-blue-600 text-white scale-110' : 'bg-white/95 text-gray-900'}`}>
          <p className="text-3xl font-black">
            {isFinished 
              ? "🎉 튜토리얼을 완료했습니다! 5초 후 메인으로 이동합니다." 
              : currentScore === "Perfect" 
                ? "Perfect!" 
                : "Perfect가 나올 때까지 표정을 더 크게 지어 주세요"}
          </p>
        </div>
      </div>

      {/* 배경 장식 (현재 타겟 강조) */}
      <div className="absolute left-10 bottom-10 opacity-20 pointer-events-none">
        <span className="text-[20rem] font-black text-white">{target.emoji}</span>
      </div>
    </div>
  );
};

export default Tutorial;