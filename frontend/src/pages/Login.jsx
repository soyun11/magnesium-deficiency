import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-black mb-2">마그네슘 부족</h1>
      <p className="text-sm font-medium text-gray-600 mb-12">웹캠 하나로 즐기는 새로운 리듬 게임 경험</p>

      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-8 text-left">로그인</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xl font-bold mb-2 ml-2">ID</label>
            <input 
              type="text" 
              className="w-full h-14 border-2 border-gray-400 rounded-full px-6 text-lg focus:outline-none focus:border-black transition-colors" 
            />
          </div>
          
          <div>
            <label className="block text-xl font-bold mb-2 ml-2">PASSWORD</label>
            <input 
              type="password" 
              className="w-full h-14 border-2 border-gray-400 rounded-full px-6 text-lg focus:outline-none focus:border-black transition-colors" 
            />
          </div>
        </div>

        <div className="text-right mt-2 mb-8">
          <button onClick={() => navigate('/signup')} className="text-sm font-bold text-gray-500 hover:underline">
            회원가입하러 가기→
          </button>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={() => navigate('/home')} // 로그인 성공 가정 시 홈으로 이동
            className="w-48 py-4 bg-[#D9D9D9] rounded-[20px] text-2xl font-bold shadow-lg hover:bg-gray-300 transition-all"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;