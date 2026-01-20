import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const userId = localStorage.getItem('userId');

const SongSelection = () => {
  const [songs, setSongs] = useState([]);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const BACKEND_URL = 'http://localhost:8080';

  const getResourceUrl = (path) => {
    if (!path) return '/G54d4NraAAAAx6y.jpg'; 
    return path.startsWith('http') ? path : `${BACKEND_URL}${path}`;
  };

  const difficultyLabel = (difficulty) => {
    if (difficulty === 1) return "EASY";
    if (difficulty === 2) return "NORMAL";
    if (difficulty === 3) return "HARD";
    return "UNKNOWN";
  };

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/songs`); 
        if (!response.ok) throw new Error('네트워크 응답 에러');
        
        const data = await response.json();
        setSongs(data);
        if (data.length > 0) setSelectedSongId(data[0].id);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        
        setSongs([
          {
            id: 1,
            title: '생일 축하 노래',
            artist: '마그네슘 부족',
            bpm: 100,
            difficulty: 1,
            filePath: '/songs/birthday_star.mp3',
            imagePath: '/images/birthday_star.png',
          }
        ]);
        setSelectedSongId(1);

      } finally {
        setIsLoading(false); 
      }
    };

    fetchSongs();
  }, []);

  const handleSelectSong = (id) => {
    if (selectedSongId === id) {
      setSelectedSongId(null); 
    } else {
      setSelectedSongId(id); 
    }
  };

  const handleStartGame = () => {
    const selectedSongData = songs.find((s) => s.id === selectedSongId);

    if (!selectedSongData) {
      alert("플레이할 노래를 선택해 주세요! 😊");
      return;
    }

    // [수정] API 데이터 형식(camelCase)에 맞게 filePath, imagePath를 전달
    navigate('/RhythmGame', {
      state: {
        song: {
          id: selectedSongData.id,
          title: selectedSongData.title,
          artist: selectedSongData.artist,
          bpm: selectedSongData.bpm,
          difficulty: selectedSongData.difficulty,
          filePath: selectedSongData.filePath,
          imagePath: selectedSongData.imagePath,
        },
      },
    });
  };

  if (isLoading) return <div className="min-h-screen bg-white flex items-center justify-center font-black text-2xl">데이터 불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col p-8">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/Home')} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-gray-800 group-hover:text-black" 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-black cursor-pointer" onClick={() => navigate('/Home')}>
            마그네슘 부족
          </h1>
        </div>
        <div className="flex gap-6 text-sm text-gray-500 font-bold">
          <button onClick={() => navigate('/Home')} className="hover:text-black">홈</button>
          <button onClick={() => navigate('/Ranking')} className="hover:text-black">랭킹</button>
          <button onClick={() => navigate('/Settings')} className="hover:text-black">설정</button>
        </div>
      </header>
      
      <main className="flex-1 grid grid-cols-2 gap-10 px-10 overflow-y-auto">
        {songs.map((song) => (
          <div 
            key={song.id}
            onClick={() => handleSelectSong(song.id)}
            className={`p-6 rounded-[40px] cursor-pointer transition-all duration-300 transform ${
              selectedSongId === song.id 
              ? 'bg-[#F8C4B4] shadow-[0_20px_40px_rgba(248,196,180,0.4)] scale-105 border-4 border-white' 
              : 'bg-gray-50 hover:bg-gray-100 border-4 border-transparent'
            }`}
          >
            <div className="w-full aspect-video rounded-2xl mb-4 overflow-hidden bg-gray-200 relative">
              {/* [수정] API 데이터 형식(camelCase)에 맞게 song.imagePath 사용 */}
              <img 
                src={getResourceUrl(song.imagePath)}
                alt={song.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/G54d4NraAAAAx6y.jpg';
                }}
              />
            </div>
            <div className="flex justify-between items-end">
              <div>
                <h3 className={`text-2xl font-black mb-1 ${selectedSongId === song.id ? 'text-white' : 'text-[#333]'}`}>
                  {song.title}
                </h3>
                <p className={`text-sm font-bold ${selectedSongId === song.id ? 'text-white/80' : 'text-gray-400'}`}>
                  {song.bpm} BPM
                </p>
              </div>
              <div className="text-right">
                <p className={`font-black text-lg mb-2 ${selectedSongId === song.id ? 'text-white' : 'text-[#333]'}`}>
                  {song.artist}
                </p>
                <span className={`text-xs font-black px-3 py-1 rounded-full ${
                  selectedSongId === song.id ? 'bg-white text-[#F8C4B4]' : 'bg-gray-200 text-gray-500'
                }`}>
                  {difficultyLabel(song.difficulty)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </main>
      
      <footer className="py-8 flex justify-center">
        <button 
          onClick={handleStartGame} 
          className={`px-24 py-6 text-3xl font-black rounded-[30px] shadow-2xl transition-all active:scale-95 ${
            selectedSongId 
            ? 'bg-[#F8C4B4] text-white hover:brightness-105' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          게임 시작
        </button>
      </footer>
    </div>
  );
};

export default SongSelection;
