import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  // 서버 메시지를 저장할 상태 변수
  const [serverMessage, setServerMessage] = useState("서버 연결 확인 중...");

  useEffect(() => {
    // 백엔드 API 호출
    fetch("http://localhost:8080/api/test")
      .then((res) => res.json())
      .then((data) => setServerMessage(data.message))
      .catch((err) => {
        console.error(err);
        setServerMessage("서버 연결 실패 (백엔드를 켰는지 확인하세요)");
      });
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      {/* 서버 상태 표시 (테스트용) */}
      <div className="absolute top-10 text-sm text-gray-400">
        {serverMessage}
      </div>

      <h1 className="text-6xl font-black mb-16">마그네슘 부족</h1>
      
      <div className="flex gap-12">
        <button 
          onClick={() => navigate('/select')} 
          className="w-48 py-5 bg-[#D9D9D9] rounded-[20px] text-2xl font-bold shadow-lg transition-transform hover:scale-105"
        >
          게임 시작
        </button>
        <button 
          onClick={() => navigate('/tutorial')} 
          className="w-48 py-5 bg-[#D9D9D9] rounded-[20px] text-2xl font-bold shadow-lg transition-transform hover:scale-105"
        >
          튜토리얼
        </button>
      </div>
    </div>
  );
};

export default Home;