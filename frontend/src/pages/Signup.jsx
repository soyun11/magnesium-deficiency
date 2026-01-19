import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [idError, setIdError] = useState('');
  const [pwError, setPwError] = useState('');
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isIdAvailable, setIsIdAvailable] = useState(false);

  const validRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;

  const handleIdChange = (e) => {
    const value = e.target.value;
    if (!validRegex.test(value)) {
      setIdError('허용되지 않는 문자입니다.');
      return;
    }
    setUserId(value);
    setIsIdChecked(false);
    setIsIdAvailable(false);

    if (value.length > 0 && (value.length < 6 || value.length > 12)) {
      setIdError('아이디는 6~12자 사이여야 합니다.');
    } else {
      setIdError('');
    }
  };

  const handlePwChange = (e) => {
    const value = e.target.value;
    if (!validRegex.test(value)) return;
    setPassword(value);
    if (value.length > 0 && value.length < 8) {
      setPwError('비밀번호는 8자 이상을 추천합니다.');
    } else {
      setPwError('');
    }
  };

  const checkDuplicate = async () => {
    if (userId.length < 6 || userId.length > 12) {
      alert('아이디 길이를 확인하세요 (6~12자)');
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/api/users/check-id?userId=${userId}`);
      if (response.ok) {
        // 상태 코드 200 (OK)
        alert("사용 가능한 아이디입니다! (Available)");
        setIsIdAvailable(true);
        setIsIdChecked(true);
      } else if (response.status === 409) {
        // 🔥 상태 코드 409 (지금 보시는 화면)
        alert("이미 존재하는 아이디입니다. 다른 걸 써주세요.");
        setIsIdAvailable(false);
      } else {
        // 그 외 진짜 에러
        alert("서버 오류가 발생했습니다.");
      }
    } catch (error) {
      alert('통신 오류');
    }
  };

  const handleSignup = async () => {
    if (!isIdChecked || !isIdAvailable) {
      alert('중복 검사를 완료해 주세요.');
      return;
    }
    try {
      const response = await fetch('http://localhost:8080/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });
      if (response.ok) {
        alert('가입을 축하합니다!');
        navigate('/login');
      }
    } catch (error) {
      alert('가입 실패');
    }
  };

  return (
    <div className="auth-container">
      <div className="bg-circle circle-1"></div>
      <div className="bg-circle circle-2"></div>

      <div className="auth-card">
        <h1 className="auth-title">회원가입</h1>
        <p className="auth-subtitle">Join the rhythm movement!</p>

        <div className="input-group">
          <div className="input-wrapper">
            <label className="field-label">NEW ID</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                value={userId}
                onChange={handleIdChange}
                placeholder="6~12자 영문/숫자"
                className="auth-input"
                style={{ paddingRight: '100px' }}
              />
              <button onClick={checkDuplicate} className="check-btn">중복확인</button>
            </div>
            {idError && <p className="error-text">{idError}</p>}
          </div>

          <div className="input-wrapper">
            <label className="field-label">PASSWORD</label>
            <input 
              type="password" 
              value={password}
              onChange={handlePwChange}
              placeholder="8자 이상 권장"
              className="auth-input"
            />
            {pwError && <p className="error-text">{pwError}</p>}
          </div>
        </div>

        <div className="auth-btn-group">
          <button 
            onClick={handleSignup} 
            disabled={!(isIdChecked && isIdAvailable && password.length >= 4 && !pwError)}
            className="auth-btn btn-primary"
          >
            SIGN UP
          </button>
          <button onClick={() => navigate('/login')} className="link-btn">
            이미 계정이 있나요? 로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;