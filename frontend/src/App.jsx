import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthSelection from './pages/AuthSelection';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import SongSelection from './pages/SongSelection';
import Tutorial from './pages/Tutorial';
import RhythmGame from './pages/RhythmGame';
import Ranking from './pages/Ranking';
import Settings from './pages/setting';
// [추가] 관리자 페이지 import
import AdminDashboard from './pages/AdminDashboard'; 

/**
 * [추가] 관리자 전용 라우트 보호 컴포넌트
 * 로그인 상태와 권한(Role)을 확인하여 접근을 제어합니다.
 */
const AdminRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole');

  if (!isLoggedIn || userRole !== 'ADMIN') {
    // 권한이 없으면 알림을 띄우고 로그인 페이지로 리다이렉트
    alert("관리자 권한이 필요한 페이지입니다.");
    return <Navigate to="/Login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 일반 공개 경로 */}
        <Route path="/" element={<AuthSelection />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        
        {/* 일반 사용자 경로 */}
        <Route path="/Home" element={<Home />} />
        <Route path="/select" element={<SongSelection />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/RhythmGame" element={<RhythmGame />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/Ranking" element={<Ranking />} />

        {/* [추가] 관리자 전용 경로 (보호됨) */}
        <Route 
          path="/AdminDashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />

        {/* <Route path="/game" element={<GamePlay />} /> */}
      </Routes>
    </Router>
  );
}

export default App;