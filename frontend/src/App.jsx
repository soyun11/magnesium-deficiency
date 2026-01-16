import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthSelection from './pages/AuthSelection';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import SongSelection from './pages/SongSelection';
import Tutorial from './pages/Tutorial';
import RhythmGame from './pages/RhythmGame';
import Ranking from './pages/Ranking';
// 나머지 10여 개의 페이지들도 여기서 import 합니다.

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthSelection />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/select" element={<SongSelection />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/RhythmGame" element={<RhythmGame />} />
        {/* <Route path="/game" element={<GamePlay />} /> */}
      </Routes>
    </Router>
  );
}

export default App;