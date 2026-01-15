import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SongSelection = () => {
  const [songs, setSongs] = useState([]); // DB에서 받아올 곡 목록
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 난이도 추가
  const difficultyLabel = (difficulty) => {
    if (difficulty === 1) return "EASY";
    if (difficulty === 2) return "NORMAL";
    if (difficulty === 3) return "HARD";
    return "UNKNOWN";
  };

  // 1. 페이지 로드 시 백엔드 API로부터 곡 정보 가져오기
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        // 백엔드 서버(8080)가 켜져 있어야 합니다.
        const response = await fetch('http://localhost:8080/api/songs'); 
        if (!response.ok) throw new Error('네트워크 응답 에러');
        
        const data = await response.json();
        setSongs(data);
        if (data.length > 0) setSelectedSongId(data[0].id); // 첫 번째 곡 자동 선택
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        // 에러 시 테스트용 임시 데이터 (백엔드가 안 켜졌을 때 대비)
        setSongs([
        {
          id: 1,
          title: '생일 축하 노래',
          artist: '마그네슘 부족',
          bpm: 100,
          difficulty: 1,
          file_path: '/birthday_star.mp3',
          img: 'http://localhost:8080/birthday_cover.jpg',
        }
      ]);
      setSelectedSongId(1);

      } finally {
        setIsLoading(false); 
      }
    };

    fetchSongs();
  }, []);

  const handleStartGame = () => {
    const selectedSongData = songs.find((s) => s.id === selectedSongId);
    if (!selectedSongData) return;

    navigate('/RhythmGame', {
      state: {
        song: {
          id: selectedSongData.id,
          title: selectedSongData.title,
          artist: selectedSongData.artist,
          bpm: selectedSongData.bpm,
          difficulty: selectedSongData.difficulty,
          audioUrl: `http://localhost:8080${selectedSongData.file_path}`,
        },
      },
    });
  };

  if (isLoading) return <div className="min-h-screen bg-white flex items-center justify-center font-black">데이터 불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col p-8">
      {/* --- 헤더 영역 (뒤로 가기 버튼 추가) --- */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          {/* 뒤로 가기 버튼 */}
          <button 
            onClick={() => navigate('/Home')} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
            aria-label="뒤로 가기"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-gray-800 group-hover:text-black" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h1 
            className="text-3xl font-black cursor-pointer" 
            onClick={() => navigate('/Home')}
          >
            마그네슘 부족
          </h1>
        </div>

        <div className="flex gap-6 text-sm text-gray-500 font-bold">
          <button onClick={() => navigate('/Home')} className="hover:text-black">홈</button>
          <span className="cursor-default">랭킹</span>
          <span className="cursor-default">설정</span>
        </div>
      </header>
      
      {/* --- 곡 리스트 영역 --- */}
      <main className="flex-1 grid grid-cols-2 gap-10 px-10 overflow-y-auto">
        {songs.map((song) => (
          <div 
            key={song.id}
            onClick={() => setSelectedSongId(song.id)}
            className={`p-6 rounded-[30px] cursor-pointer transition-all ${
              selectedSongId === song.id ? 'bg-[#F8C4B4] shadow-lg scale-105' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <div className="w-full aspect-video rounded-2xl mb-4 overflow-hidden bg-gray-200">
              <img 
                src={song.img ?? '/G54d4NraAAAAx6y.jpg'}
                alt={song.title} 
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/G54d4NraAAAAx6y.jpg';
                }}
              />
            </div>

            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-xl font-bold">{song.title}</h3>
                <p className="text-sm">{song.bpm} BPM</p>
              </div>
              <div className="text-right font-bold">
                <p>{song.artist}</p>
                <span className="text-xs bg-white/50 px-2 py-1 rounded-full">{difficultyLabel(song.difficulty)}</span>
              </div>
            </div>
          </div>
        ))}
      </main>
      
      {/* --- 하단 버튼 영역 --- */}
      <footer className="py-8 flex justify-center">
        <button 
          onClick={handleStartGame} 
          className="px-20 py-4 bg-[#F8C4B4] text-3xl font-black rounded-2xl shadow-xl hover:scale-105 transition-transform"
        >
          게임 시작
        </button>
      </footer>
    </div>
  );
};

export default SongSelection;