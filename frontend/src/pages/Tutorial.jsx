import React, { useState, useEffect, useRef } from 'react';
import Webcam from "react-webcam";
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
const userId = localStorage.getItem('userId');

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
            
            setTimeout(() => {
              navigate('/Home');
            }, 4000);

          } else if (!isFinishedRef.current) {
            if (prob >= 0.5) {
              setCurrentScore("Good");
            } else {
              setCurrentScore("MISS");
            }
          }
        }
      }, 100); 
    }
    return () => clearInterval(interval);
  }, [isModelLoaded, isFinished, target, navigate]);

  if (!target) return <div className="bg-[#FFF9F9] min-h-screen flex items-center justify-center font-black text-[#F8C4B4] text-2xl">준비 중...</div>;

  return (
    <div className="relative min-h-screen bg-[#FFF9F9] overflow-hidden font-sans text-[#333]">
      {/* 배경 원형 장식 */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#B4E4F8] opacity-20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#F8C4B4] opacity-20 rounded-full blur-3xl" />

      {/* 카메라 영역 (좌우반전 적용) */}
      <div className="absolute inset-0 flex items-center justify-center p-10">
        <div className="relative w-full h-full max-w-5xl rounded-[40px] overflow-hidden shadow-2xl border-8 border-white bg-white">
          <Webcam 
            audio={false} 
            ref={webcamRef} 
            mirrored={true} // 좌우반전 핵심 속성
            className="w-full h-full object-cover" 
          />
          {/* 카메라 오버레이 어둡게 (인식률 시각화 보조) */}
          <div className="absolute inset-0 bg-black/5 pointer-events-none" />
        </div>
      </div>

      {/* 상단 헤더 UI */}
      <header className="absolute top-0 w-full p-10 z-20 flex justify-between items-start">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/Home')} 
            className="p-4 bg-white shadow-lg rounded-full hover:bg-gray-50 transition-all group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="bg-white/90 backdrop-blur-md px-10 py-5 rounded-[30px] shadow-xl border-4 border-[#F8C4B4]">
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Mission</p>
          <h2 className="text-4xl font-black text-[#333] flex items-center gap-3">
            {target.label} <span className="text-5xl">{target.emoji}</span>
          </h2>
        </div>
      </header>

      {/* 중앙 판정 UI */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        {currentScore && (
          <h2 className={`text-[12rem] font-black italic tracking-tighter drop-shadow-2xl transition-all duration-100
            ${currentScore === 'Perfect' ? 'text-[#F8C4B4] scale-110' : 
              currentScore === 'Good' ? 'text-[#B4E4F8]' : 'text-gray-300 opacity-50 scale-90'}`}>
            {currentScore}{currentScore === 'Perfect' ? '!' : ''}
          </h2>
        )}
      </div>

      {/* 하단 안내 캡슐 UI */}
      <div className="absolute bottom-16 w-full flex flex-col items-center z-20">
        <div className={`px-16 py-6 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-500 border-4
          ${isFinished ? 'bg-[#F8C4B4] border-white text-white scale-105' : 'bg-white border-[#B4E4F8] text-[#333]'}`}>
          <p className="text-2xl font-black flex items-center gap-4">
            {isFinished 
              ? "🎉 튜토리얼 완료! 잠시 후 홈으로 이동합니다." 
              : <>
                  <span className="w-4 h-4 bg-[#B4E4F8] rounded-full animate-ping" />
                  {currentScore === "Perfect" ? "와우! 완벽해요!" : "표정을 더 크게 지어보세요!"}
                </>
            }
          </p>
        </div>
        
        {/* 서버 상태 느낌의 안내 문구 */}
        {!isFinished && (
            <p className="mt-4 text-sm font-bold text-gray-400 bg-white/50 px-4 py-1 rounded-full">
                정확한 인식을 위해 밝은 곳에서 플레이해주세요.
            </p>
        )}
      </div>
    </div>
  );
};

export default Tutorial;