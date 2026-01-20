import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
const userId = localStorage.getItem('userId');

const Home = () => {
  const navigate = useNavigate();
  const [serverStatus, setServerStatus] = useState("connecting"); // connecting, success, error
  const [serverMessage, setServerMessage] = useState("서버 연결 확인 중...");

  useEffect(() => {
    fetch("http://localhost:8080/api/test")
      .then((res) => res.json())
      .then((data) => {
        setServerMessage(data.message);
        setServerStatus("success");
      })
      .catch((err) => {
        console.error(err);
        setServerMessage("서버 오프라인");
        setServerStatus("error");
      });
  }, []);

  return (
    <div className="relative min-h-screen bg-[#FFF9F9] flex flex-col items-center justify-center overflow-hidden">
      
      {/* --- 상단 헤더 (우측 정렬 로직 핵심) --- */}
      <header className="absolute top-0 left-0 right-0 w-full p-8 flex justify-between items-center z-20">
        {/* 좌측 로고 영역: justify-between에 의해 왼쪽 끝 고정 */}
        <h5 className="font-black text-[#F8C4B4] mb-4 text-center">{userId}</h5>
        {/* 우측 네비게이션 영역: justify-between에 의해 오른쪽 끝 고정 */}
        <nav className="flex gap-8 text-sm text-gray-500 font-bold">
          <button 
            onClick={() => navigate('/Ranking')} 
            className="hover:text-black hover:scale-105 transition-all"
          >
            랭킹
          </button>
          <button 
            onClick={() => navigate('/Settings')} 
            className="hover:text-black hover:scale-105 transition-all"
          >
            설정
          </button>
        </nav>
      </header>

      {/* --- 배경 장식 (파스텔 원형 엘리먼트) --- */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#F8C4B4] opacity-20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#B4E4F8] opacity-20 rounded-full blur-3xl animate-pulse" />
      

      {/* --- 서버 상태 표시 --- */}
      <div className="absolute top-28 flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full shadow-sm border border-white/50">
        <div className={`w-2 h-2 rounded-full ${
          serverStatus === "success" ? "bg-green-400 animate-ping" : 
          serverStatus === "error" ? "bg-red-400" : "bg-yellow-400"
        }`} />
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          {serverMessage}
        </span>
      </div>
      

      {/* --- 메인 타이틀 섹션 --- */}
      <div className="text-center z-10 mt-12">
        <div className="inline-block px-4 py-1 mb-6 bg-[#F8C4B4] text-white text-sm font-black rounded-lg transform -rotate-2">
          NEW RHYTHM GAME
        </div>
        <h1 className="text-8xl font-black text-[#333] mb-4 tracking-tighter">
          마그네슘 <span className="text-[#F8C4B4]">부족</span>
        </h1>
        <p className="text-gray-400 font-medium mb-16 tracking-wide">
          당신의 표정이 리듬이 되는 순간
        </p>
      </div>
      
      {/* --- 버튼 그룹 --- */}
      <div className="flex gap-8 z-10">
        <button 
          onClick={() => navigate('/select')} 
          className="group relative w-56 py-6 bg-white rounded-[30px] shadow-[0_15px_35px_rgba(248,196,180,0.4)] transition-all hover:-translate-y-2 active:translate-y-0"
        >
          <div className="absolute inset-0 bg-[#F8C4B4] rounded-[30px] opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative text-2xl font-black text-[#F8C4B4] group-hover:text-white transition-colors">
            게임 시작
          </span>
        </button>

        <button 
          onClick={() => navigate('/tutorial')} 
          className="group w-56 py-6 bg-white/40 backdrop-blur-sm border-2 border-white rounded-[30px] shadow-xl transition-all hover:bg-white hover:border-[#F8C4B4]"
        >
          <span className="text-2xl font-black text-gray-400 group-hover:text-[#F8C4B4] transition-colors">
            튜토리얼
          </span>
        </button>
      </div>

      {/* --- 하단 푸터 --- */}
      <div className="absolute bottom-10 text-gray-300 text-sm font-bold">
        © 2026 Team Magnesium Deficiency. All rights reserved.
      </div>

    </div>
  );
};

export default Home;