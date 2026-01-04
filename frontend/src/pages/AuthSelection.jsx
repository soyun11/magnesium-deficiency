import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-black mb-4">마그네슘 부족</h1>
        <p className="text-lg font-medium text-gray-600">웹캠 하나로 즐기는 새로운 리듬 게임 경험</p>
      </div>
      
      <div className="flex gap-12">
        <button 
          onClick={() => navigate('/login')}
          className="w-48 py-5 bg-[#D9D9D9] rounded-[20px] text-2xl font-bold shadow-lg hover:bg-gray-300 transition-all"
        >
          로그인
        </button>
        <button 
          onClick={() => navigate('/signup')}
          className="w-48 py-5 bg-[#D9D9D9] rounded-[20px] text-2xl font-bold shadow-lg hover:bg-gray-300 transition-all"
        >
          회원가입
        </button>
      </div>
    </div>
  );
};

export default AuthSelection;