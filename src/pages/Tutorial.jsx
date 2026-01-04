import React, { useState } from 'react';
import Webcam from "react-webcam";
import { useNavigate } from 'react-router-dom';

const Tutorial = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const feedback = {
    1: { text: "놀란 표정을 지어보세요", sub: "", color: "text-white", emoji: "😯" },
    2: { text: "Good~", sub: "퍼펙트가 나올 때까지 더 크게 놀란 표정을 해주세요", color: "text-green-400", emoji: "😯" },
    3: { text: "Perfect!", sub: "잘했어요! 지금처럼만 하면 돼요!", color: "text-yellow-300", emoji: "😲" }
  };

  return (
    <div className="relative min-h-screen bg-black">
      <Webcam audio={false} className="absolute inset-0 w-full h-full object-cover" />
      
      <header className="absolute top-0 w-full py-4 px-8 flex justify-end gap-6 text-white/80 z-10">
        <button onClick={() => navigate('/')}>홈</button>
        <span>랭킹</span><span>설정</span>
      </header>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {step > 1 && <h2 className={`text-8xl font-black drop-shadow-2xl ${feedback[step].color}`}>{feedback[step].text}</h2>}
      </div>

      <div className="absolute bottom-10 w-full flex flex-col items-center gap-6">
        <div className="bg-[#F8C4B4]/90 px-8 py-3 rounded-full shadow-lg font-bold text-xl">
          {step === 1 ? feedback[step].text : feedback[step].sub}
        </div>
        <div className="absolute right-10 bottom-0 text-8xl">{feedback[step].emoji}</div>
      </div>

      {/* 테스트용 스텝 버튼 */}
      <div className="absolute left-5 bottom-5 flex gap-2">
        {[1, 2, 3].map(v => <button key={v} onClick={() => setStep(v)} className="bg-white/20 px-3 py-1 text-white rounded">스텝 {v}</button>)}
      </div>
    </div>
  );
};

export default Tutorial;