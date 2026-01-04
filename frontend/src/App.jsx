import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SongSelection from './pages/SongSelection';
import Tutorial from './pages/Tutorial';
// 나머지 10여 개의 페이지들도 여기서 import 합니다.

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/select" element={<SongSelection />} />
        <Route path="/tutorial" element={<Tutorial />} />
        {/* <Route path="/game" element={<GamePlay />} /> */}
      </Routes>
    </Router>
  );
}

export default App;