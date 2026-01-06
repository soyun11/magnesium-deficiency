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
  
  // [수정] 실시간 상태 확인을 위한 Ref (상태 업데이트 지연 방지)
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
        // [핵심] 이미 끝났다면 연산 자체를 수행하지 않음
        if (isFinishedRef.current) return;

        if (webcamRef.current && webcamRef.current.video.readyState === 4) {
          const video = webcamRef.current.video;
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          // 연산 중간에 끝났을 경우를 대비해 한 번 더 체크
          if (isFinishedRef.current || !detections || detections.length === 0) return;

          const prob = detections[0].expressions[target.key];

          // [수정] 무표정일 때는 판정 기준을 더 엄격하게 (0.95), 일반 표정은 0.8
          const perfectThreshold = target.key === 'neutral' ? 0.95 : 0.8;

          if (prob >= perfectThreshold) {
            // Perfect 달성 시 즉시 모든 플래그 차단
            isFinishedRef.current = true;
            setIsFinished(true);
            setCurrentScore("Perfect");
            
            console.log("🎯 Perfect 달성! 모든 인식을 중단합니다.");

            setTimeout(() => {
              navigate('/Home');
            }, 5000);

          } else if (!isFinishedRef.current) { // 이미 끝난 게 아닐 때만 점수 업데이트
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
    <div className="relative min-h-screen bg-black overflow-hidden">
      <Webcam audio={false} ref={webcamRef} className="absolute inset-0 w-full h-full object-cover mirror" />

      {/* 상단 미션 안내 */}
      <header className="absolute top-0 w-full py-8 px-12 z-10">
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