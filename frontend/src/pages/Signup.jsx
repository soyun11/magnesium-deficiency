import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  
  // 1. 상태 관리
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [idError, setIdError] = useState('');
  const [pwError, setPwError] = useState('');
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isIdAvailable, setIsIdAvailable] = useState(false);

  // [핵심] 영문 대소문자, 숫자, 특수문자만 허용하는 정규표현식
  const validRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;

  // 2. 아이디 입력 시 처리
  const handleIdChange = (e) => {
    const value = e.target.value;
    
    // 허용되지 않는 문자가 들어오면 입력을 막거나 에러 표시
    if (!validRegex.test(value)) {
      setIdError('영문, 숫자, 특수문자만 입력 가능합니다.');
      return; // 잘못된 문자는 입력되지 않음
    }

    setUserId(value);
    setIsIdChecked(false);
    setIsIdAvailable(false);

    if (value.length > 0 && (value.length < 6 || value.length > 12)) {
      setIdError('아이디는 6자 이상 12자 이하여야 합니다.');
    } else {
      setIdError('');
    }
  };

  // 3. 비밀번호 입력 시 처리
  const handlePwChange = (e) => {
    const value = e.target.value;
    
    if (!validRegex.test(value)) {
      setPwError('영문, 숫자, 특수문자만 사용 가능합니다.');
      return;
    }
    
    setPassword(value);
    if (value.length > 0 && value.length < 8) {
      setPwError('비밀번호는 최소 8자 이상 권장합니다.');
    } else {
      setPwError('');
    }
  };

  // 4. 아이디 중복 검사
  const checkDuplicate = async () => {
    if (userId.length < 6 || userId.length > 12) {
      alert('아이디 길이를 확인해 주세요. (6~12자)');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/users/check-id?userId=${userId}`);
      if (!response.ok) throw new Error('서버 응답 오류');
      
      const isDuplicate = await response.json();

      if (isDuplicate) {
        alert('이미 사용 중인 아이디입니다.');
        setIsIdAvailable(false);
      } else {
        alert('사용 가능한 아이디입니다!');
        setIsIdAvailable(true);
      }
      setIsIdChecked(true);
    } catch (error) {
      alert('서버와 통신할 수 없습니다.');
    }
  };

  // 5. 최종 회원가입 제출
  const handleSignup = async () => {
    if (!isIdChecked || !isIdAvailable) {
      alert('아이디 중복 검사를 완료해 주세요.');
      return;
    }
    
    if (password.length < 4) {
      alert('비밀번호를 입력해 주세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });

      if (response.ok) {
        alert('회원가입이 완료되었습니다!');
        navigate('/login');
      } else {
        alert('회원가입 실패');
      }
    } catch (error) {
      alert('서버 오류 발생');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-black mb-2">마그네슘 부족</h1>
      <p className="text-sm font-medium text-gray-600 mb-16">웹캠 하나로 즐기는 새로운 리듬 게임 경험</p>

      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-8 text-left">회원가입</h2>
        <div className="space-y-6">
          {/* ID 필드 */}
          <div className="relative">
            <label className="block text-xl font-bold mb-2 ml-2">ID</label>
            <div className="relative">
              <input 
                type="text" 
                value={userId}
                onChange={handleIdChange}
                placeholder="6~12자로 설정해 주세요"
                className={`w-full h-14 border-2 rounded-full px-6 text-lg focus:outline-none focus:border-black pr-32 
                  ${idError ? 'border-red-500' : isIdChecked && isIdAvailable ? 'border-green-500' : 'border-gray-400'}`} 
              />
              <button 
                onClick={checkDuplicate}
                className="absolute right-2 top-2 bottom-2 bg-gray-300 px-6 rounded-full font-bold hover:bg-gray-400 transition-colors text-sm"
              >
                중복 확인
              </button>
            </div>
            {idError && <p className="text-red-500 text-xs mt-2 ml-4 font-bold">{idError}</p>}
          </div>
          
          {/* Password 필드 */}
          <div>
            <label className="block text-xl font-bold mb-2 ml-2">PASSWORD</label>
            <input 
              type="password" 
              value={password}
              onChange={handlePwChange}
              placeholder="password"
              className={`w-full h-14 border-2 rounded-full px-6 text-lg focus:outline-none focus:border-black
                ${pwError ? 'border-red-500' : 'border-gray-400'}`} 
            />
            {pwError && <p className="text-red-500 text-xs mt-2 ml-4 font-bold">{pwError}</p>}
          </div>
        </div>

        <div className="text-right mt-2 mb-12">
          <button onClick={() => navigate('/login')} className="text-sm font-bold text-gray-500 hover:underline">
            로그인하러 가기→
          </button>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={handleSignup}
            className={`w-48 py-4 bg-[#F8C4B4] rounded-[20px] text-2xl font-bold shadow-lg hover:bg-[#f3b09a] transition-all
              ${(isIdChecked && isIdAvailable && password.length > 0 && !pwError) 
                ? 'bg-[#F8C4B4] hover:bg-[#f3b09a]' 
                : 'bg-[#D9D9D9] cursor-not-allowed'}`}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;