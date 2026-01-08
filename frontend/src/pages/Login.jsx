import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  
  // 1. 상태 관리
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // [규칙] 영문, 숫자, 특수문자만 허용
  const validRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;

  // 2. 로그인 처리 함수
  const handleLogin = async () => {
    // 유효성 검사
    if (!userId || !password) {
      alert('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    try {
      // 백엔드 로그인 API 호출
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });

      if (response.ok) {
        const userData = await response.json(); // 서버에서 유저 정보(아이디, 닉네임 등) 반환
        
        // [핵심] 로그인 정보 로컬 스토리지에 저장 (브라우저를 닫아도 유지)
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', userData.userId);
        
        alert(`${userData.userId}님, 환영합니다!`);
        navigate('/Home'); // 메인 화면으로 이동
      } else {
        const errorData = await response.text();
        alert(errorData || '아이디 또는 비밀번호가 일치하지 않습니다.');
      }
    } catch (err) {
      console.error('로그인 에러:', err);
      alert('서버 연결에 실패했습니다. 백엔드 서버가 켜져 있는지 확인하세요.');
    }
  };

  // 입력 핸들러
  const onIdChange = (e) => {
    if (validRegex.test(e.target.value)) setUserId(e.target.value);
  };

  const onPwChange = (e) => {
    if (validRegex.test(e.target.value)) setPassword(e.target.value);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-black mb-2">마그네슘 부족</h1>
      <p className="text-sm font-medium text-gray-600 mb-16">웹캠 하나로 즐기는 새로운 리듬 게임 경험</p>

      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-8 text-left">로그인</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xl font-bold mb-2 ml-2">ID</label>
            <input 
              type="text" 
              value={userId}
              onChange={onIdChange}
              placeholder="ID"
              className="w-full h-14 border-2 border-gray-400 rounded-full px-6 text-lg focus:outline-none focus:border-black transition-colors" 
            />
          </div>
          
          <div>
            <label className="block text-xl font-bold mb-2 ml-2">PASSWORD</label>
            <input 
              type="password"
              value={password}
              onChange={onPwChange}
              placeholder="Password"
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
            onClick={handleLogin}
            className="w-48 py-4 bg-[#F8C4B4] rounded-[20px] text-2xl font-bold shadow-lg hover:bg-[#f3b09a] transition-all"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;