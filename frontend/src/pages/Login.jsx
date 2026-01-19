import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  // 기존 허용 정규표현식 (영문, 숫자, 특수문자)
  const validRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
  // 한글 감지 정규표현식
  const koreanRegex = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;

  // 입력 핸들러 함수
  const handleInputChange = (e, setter) => {
    const value = e.target.value;

    // 1. 한글이 포함되어 있는지 먼저 검사
    if (koreanRegex.test(value)) {
      alert('한글은 입력할 수 없습니다.');
      return; // 한글이 있으면 여기서 중단하여 setter를 실행하지 않음
    }

    // 2. 한글이 없고, 기존 validRegex(특수문자/영문/숫자)를 통과할 때만 상태 업데이트
    if (value === '' || validRegex.test(value)) {
      setter(value);
    }
  };

  const handleLogin = async () => {
    if (!userId || !password) {
      alert('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    const isAdmin = userId === 'admin123';
    const API_URL = isAdmin 
      ? 'http://localhost:8080/api/admin/login' 
      : 'http://localhost:8080/api/users/login';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isAdmin ? { id: userId, password } : { userId, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        
        if (isAdmin) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userRole', 'ADMIN');
          localStorage.setItem('userId', userId);
          alert("관리자님, 환영합니다!");
          navigate('/AdminDashboard');
        } else {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userRole', 'USER');
          localStorage.setItem('userId', userData.userId);
          alert(`${userData.userId}님, 환영합니다!`);
          navigate('/Home');
        }
      } else {
        const errorData = await response.text();
        alert(errorData || '아이디 또는 비밀번호가 일치하지 않습니다.');
      }
    } catch (err) {
      console.error('로그인 에러:', err);
      alert('서버 연결 실패');
    }
  };

  return (
    <div className="auth-container">
      <div className="bg-circle circle-1"></div>
      <div className="bg-circle circle-2"></div>

      <div className="auth-card">
        <h1 className="auth-title">로그인</h1>
        <p className="auth-subtitle">Welcome back to Magnesium Deficiency!</p>

        <div className="input-group">
          <div className="input-wrapper">
            <label className="field-label">USER ID</label>
            <input 
              type="text" 
              value={userId}
              // handleInputChange를 사용하도록 수정
              onChange={(e) => handleInputChange(e, setUserId)}
              placeholder="아이디를 입력하세요"
              className="auth-input"
            />
          </div>

          <div className="input-wrapper">
            <label className="field-label">PASSWORD</label>
            <input 
              type="password" 
              value={password}
              // handleInputChange를 사용하도록 수정
              onChange={(e) => handleInputChange(e, setPassword)}
              placeholder="비밀번호를 입력하세요"
              className="auth-input"
            />
          </div>
        </div>

        <div className="auth-btn-group">
          <button onClick={handleLogin} className="auth-btn btn-primary">
            LOGIN
          </button>
          <button onClick={() => navigate('/signup')} className="link-btn">
            아직 계정이 없으신가요? 회원가입하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;