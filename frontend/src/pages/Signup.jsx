import React from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-black mb-2">마그네슘 부족</h1>
      <p className="text-sm font-medium text-gray-600 mb-16">웹캠 하나로 즐기는 새로운 리듬 게임 경험</p>

      <div className="w-full max-w-md">
        <div className="space-y-6">
          <div className="relative">
            <label className="block text-xl font-bold mb-2 ml-2">ID</label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full h-14 border-2 border-gray-400 rounded-full px-6 text-lg focus:outline-none focus:border-black pr-32" 
              />
              <button className="absolute right-2 top-2 bottom-2 bg-gray-300 px-6 rounded-full font-bold hover:bg-gray-400 transition-colors text-sm">
                중복 확인
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-xl font-bold mb-2 ml-2">PASSWORD</label>
            <input 
              type="password" 
              className="w-full h-14 border-2 border-gray-400 rounded-full px-6 text-lg focus:outline-none focus:border-black" 
            />
          </div>
        </div>

        <div className="text-right mt-2 mb-12">
          <button onClick={() => navigate('/login')} className="text-sm font-bold text-gray-500 hover:underline">
            로그인하러 가기→
          </button>
        </div>

        <div className="flex justify-center">
          <button className="w-48 py-4 bg-[#D9D9D9] rounded-[20px] text-2xl font-bold shadow-lg hover:bg-gray-300 transition-all">
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;