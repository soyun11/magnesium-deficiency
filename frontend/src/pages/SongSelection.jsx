import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SONGS = [
  { id: 1, title: '생일 축하송', artist: 'Suno AI', bpm: 100, diff: 'EASY', stars: 1 },
  { id: 2, title: '생일 축하송2', artist: 'Suno AI', bpm: 110, diff: 'NORMAL', stars: 2 },
  { id: 3, title: '딸기시루 줄 너무 길어', artist: 'Suno AI', bpm: 130, diff: 'HARD', stars: 3 },
  { id: 4, title: '곰세마리', artist: 'Suno AI', bpm: 110, diff: 'NORMAL', stars: 2 },
];

const SongSelection = () => {
  const [selectedSong, setSelectedSong] = useState(1);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black" onClick={() => navigate('/')}>마그네슘 부족</h1>
        <div className="flex gap-6 text-sm text-gray-500">
          <button onClick={() => navigate('/')}>홈</button>
          <span>랭킹</span><span>설정</span>
        </div>
      </header>
      <main className="flex-1 grid grid-cols-2 gap-10 px-10 overflow-y-auto">
        {SONGS.map((song) => (
          <div 
            key={song.id}
            onClick={() => setSelectedSong(song.id)}
            className={`p-6 rounded-[30px] cursor-pointer transition-all ${selectedSong === song.id ? 'bg-[#F8C4B4] shadow-lg scale-105' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <div className="w-full aspect-video bg-[#FDEBD0] rounded-2xl mb-4 flex items-center justify-center font-bold text-gray-400">SONG IMAGE</div>
            <div className="flex justify-between items-end">
              <div><h3 className="text-xl font-bold">{song.title}</h3><p className="text-sm">{song.bpm} BPM</p></div>
              <div className="text-right font-bold"><p>{song.artist}</p><span className="text-xs bg-white/50 px-2 py-1 rounded-full">{song.diff}</span></div>
            </div>
          </div>
        ))}
      </main>
      <footer className="py-8 flex justify-center">
        <button onClick={()=> navigate('/RhythmGame')} className="px-20 py-4 bg-[#F8C4B4] text-3xl font-black rounded-2xl shadow-xl hover:scale-105 transition-transform">게임 시작</button>
    </footer>
    </div>
  );
};

export default SongSelection;