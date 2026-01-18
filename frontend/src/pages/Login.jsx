import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const validRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;

  const handleLogin = async () => {
    if (!userId || !password) {
      alert('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    // 관리자 계정인지 확인 (admin123인 경우 관리자 API 호출)
    const isAdmin = userId === 'admin123';
    const API_URL = isAdmin 
      ? 'http://localhost:8080/api/admin/login' 
      : 'http://localhost:8080/api/users/login';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 관리자 DTO는 'id'를 사용하고 일반 유저는 'userId'를 사용하는 경우에 대비한 처리
        body: JSON.stringify(isAdmin ? { id: userId, password } : { userId, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        
        if (isAdmin) {
          // 관리자 로그인 성공 시
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userRole', 'ADMIN'); // 관리자 권한 저장
          localStorage.setItem('userId', userId);
          alert("관리자님, 환영합니다!");
          navigate('/AdminDashboard'); // 관리자 전용 페이지로 이동
        } else {
          // 일반 사용자 로그인 성공 시
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
              onChange={(e) => validRegex.test(e.target.value) && setUserId(e.target.value)}
              placeholder="아이디를 입력하세요"
              className="auth-input"
            />
          </div>

          <div className="input-wrapper">
            <label className="field-label">PASSWORD</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => validRegex.test(e.target.value) && setPassword(e.target.value)}
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