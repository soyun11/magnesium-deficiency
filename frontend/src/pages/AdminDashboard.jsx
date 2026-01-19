import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 새 노래 입력을 위한 상태
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    bpm: '',
    difficulty: 1,
    file_path: '',
    image_path: '', // DB schema에 추가 권장
    duration: 0
  });

  const BACKEND_URL = 'http://localhost:8080';

  // 1. 노래 목록 불러오기
  const fetchSongs = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/songs`);
      if (response.ok) {
        const data = await response.json();
        setSongs(data);
      }
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // 2. 입력 값 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSong({ ...newSong, [name]: value });
  };

  // 3. 노래 추가 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSong),
      });

      if (response.ok) {
        alert("새 노래가 등록되었습니다! 🎵");
        setNewSong({ title: '', artist: '', bpm: '', difficulty: 1, file_path: '', image_path: '', duration: 0 });
        fetchSongs(); // 목록 새로고침
      }
    } catch (error) {
      alert("등록에 실패했습니다.");
    }
  };

  // 4. 노래 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("정말 이 곡을 삭제하시겠습니까?")) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/songs/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setSongs(songs.filter(song => song.id !== id));
      }
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-[#333]">
      {/* 헤더 */}
      <header className="flex justify-between items-center mb-10 max-w-6xl mx-auto">
        <div>
          <h1 className="text-4xl font-black text-black mb-2">Admin Dashboard</h1>
          <p className="text-gray-500 font-bold">리듬게임 콘텐츠 관리 시스템</p>
        </div>
        <button 
          onClick={() => navigate('/Home')}
          className="px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl font-black hover:bg-gray-100 transition-all"
        >
          나가기
        </button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 노래 추가 섹션 */}
        <section className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-[#F8C4B4] rounded-full"></span>
              새 노래 등록
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-black text-gray-400 ml-2 mb-1">곡 제목</label>
                <input name="title" value={newSong.title} onChange={handleInputChange} placeholder="ex) Moonlight" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#F8C4B4] outline-none font-bold" required />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 ml-2 mb-1">아티스트</label>
                <input name="artist" value={newSong.artist} onChange={handleInputChange} placeholder="아티스트 명" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#F8C4B4] outline-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 ml-2 mb-1">BPM</label>
                  <input name="bpm" type="number" value={newSong.bpm} onChange={handleInputChange} placeholder="120" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#F8C4B4] outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 ml-2 mb-1">난이도 (1-3)</label>
                  <select name="difficulty" value={newSong.difficulty} onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#F8C4B4] outline-none font-bold appearance-none">
                    <option value={1}>EASY</option>
                    <option value={2}>NORMAL</option>
                    <option value={3}>HARD</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 ml-2 mb-1">파일 경로 (.mp3)</label>
                <input name="file_path" value={newSong.file_path} onChange={handleInputChange} placeholder="/songs/filename.mp3" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#F8C4B4] outline-none font-bold" required />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 ml-2 mb-1">이미지 경로 (.png)</label>
                <input name="image_path" value={newSong.image_path} onChange={handleInputChange} placeholder="/images/filename.png" className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#F8C4B4] outline-none font-bold" />
              </div>
              <button type="submit" className="mt-4 w-full py-4 bg-[#F8C4B4] text-white rounded-2xl font-black text-lg shadow-lg shadow-[#F8C4B4]/30 hover:brightness-105 active:scale-95 transition-all">
                노래 추가하기
              </button>
            </form>
          </div>
        </section>

        {/* 노래 목록 테이블 섹션 */}
        <section className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 min-h-[600px]">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-gray-200 rounded-full"></span>
              현재 노래 목록 ({songs.length})
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-gray-400 text-sm font-black">
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">곡 정보</th>
                    <th className="px-4 py-2">난이도</th>
                    <th className="px-4 py-2 text-right">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map((song) => (
                    <tr key={song.id} className="bg-gray-50 hover:bg-gray-100 transition-colors group">
                      <td className="px-4 py-4 rounded-l-2xl font-bold text-gray-400">{song.id}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg overflow-hidden border border-gray-200">
                             <img src={`${BACKEND_URL}${song.image_path}`} alt="" className="w-full h-full object-cover" onError={(e)=>e.target.src='https://via.placeholder.com/40'}/>
                          </div>
                          <div>
                            <p className="font-black text-black leading-tight">{song.title}</p>
                            <p className="text-xs font-bold text-gray-400">{song.artist} | {song.bpm} BPM</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                          song.difficulty === 3 ? 'bg-red-100 text-red-500' : 
                          song.difficulty === 2 ? 'bg-blue-100 text-blue-500' : 'bg-green-100 text-green-500'
                        }`}>
                          {song.difficulty === 1 ? 'EASY' : song.difficulty === 2 ? 'NORMAL' : 'HARD'}
                        </span>
                      </td>
                      <td className="px-4 py-4 rounded-r-2xl text-right">
                        <button 
                          onClick={() => handleDelete(song.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {songs.length === 0 && !isLoading && (
                <div className="text-center py-20 text-gray-400 font-bold">등록된 노래가 없습니다.</div>
              )}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default AdminDashboard;