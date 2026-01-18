import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">관리자 전용 대시보드</h1>
      <p>이곳에서 노래 목록 관리 및 유저 정보를 확인할 수 있습니다.</p>
      <button onClick={() => navigate('/Home')} className="mt-4 p-2 bg-gray-200 rounded">홈으로</button>
    </div>
  );
};
export default AdminDashboard;