import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <h1 className="text-6xl font-black mb-16">마그네슘 부족</h1>
      <div className="flex gap-12">
        <button onClick={() => navigate('/select')} className="w-48 py-5 bg-[#D9D9D9] rounded-[20px] text-2xl font-bold shadow-lg">게임 시작</button>
        <button onClick={() => navigate('/tutorial')} className="w-48 py-5 bg-[#D9D9D9] rounded-[20px] text-2xl font-bold shadow-lg">튜토리얼</button>
      </div>
    </div>
  );
};

export default Home;