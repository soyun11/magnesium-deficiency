import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const userId = localStorage.getItem('userId');

const Settings = () => {
  const navigate = useNavigate();

  // 설정 상태 관리 (이미지 예시의 84%로 초기값 설정)
  const [volume, setVolume] = useState(84);

  // [수정] 저장 버튼 핸들러: 이제 /select 페이지로 이동합니다.
  const handleSave = () => {
    const settings = { volume };
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    alert("설정이 저장되었습니다! 🎵");
    navigate('/select'); // App.jsx에 정의된 곡 선택 페이지 경로
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem('user'); 
      navigate('/Login');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-8 font-sans">
      {/* 헤더 부분 */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-gray-800 group-hover:text-black" 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-black cursor-pointer" onClick={() => navigate('/Home')}>
            마그네슘 부족
          </h1>
        </div>
        <div className="flex gap-6 text-sm text-gray-500 font-bold">
          <button onClick={() => navigate('/Home')} className="hover:text-black">홈</button>
          <button onClick={() => navigate('/Ranking')} className="hover:text-black">랭킹</button>
          <span className="text-black border-b-2 border-[#F8C4B4]">설정</span>
        </div>
      </header>

      {/* 메인 설정 영역 */}
      <main className="flex-1 max-w-2xl mx-auto w-full flex flex-col gap-10">
        <h2 className="text-4xl font-black text-[#333] mb-4 text-center">게임 설정</h2>
        <h5 className="text-4xl font-black text-[#F8C4B4] mb-4 text-center">{userId}</h5>

        {/* 배경 음악 설정 카드 */}
        <section className="bg-gray-50 p-8 rounded-[40px] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black">배경 음악</h3>
            <span className="text-[#F8C4B4] font-black text-2xl">{volume}%</span>
          </div>
          <input 
            type="range" 
            min="0" max="100" 
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F8C4B4]"
          />
        </section>

        {/* 로그아웃 버튼 섹션 (흰색 배경, 빨간 글씨, 큰 디자인) */}
        <section className="flex justify-center">
          <button 
            onClick={handleLogout}
            className="px-24 py-6 text-3xl font-black rounded-[30px] shadow-xl transition-all active:scale-95 bg-white text-red-500 border-2 border-gray-100 hover:bg-gray-50"
          >
            로그아웃하기
          </button>
        </section>
      </main>

      {/* 하단 저장 버튼 */}
      <footer className="py-8 flex justify-center">
        <button 
          onClick={handleSave}
          className="px-24 py-6 text-3xl font-black rounded-[30px] shadow-2xl transition-all active:scale-95 bg-[#F8C4B4] text-white hover:brightness-105"
        >
          설정 저장하기
        </button>
      </footer>
    </div>
  );
};

export default Settings;