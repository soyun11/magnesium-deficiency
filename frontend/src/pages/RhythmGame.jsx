import React, { useState, useEffect, useRef } from 'react';
import './RhythmGame.css';

const SONGS = [
  { id: 1, title: "테스트 곡 1", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }, // 외부 URL로 테스트
];

const EMOTIONS = ['happy', 'sad', 'angry', 'neutral', 'surprised'];
const EMOJI_MAP = { happy: '😊', sad: '😭', angry: '😡', neutral: '😟', surprised: '😮' };

const RhythmGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [selectedSong, setSelectedSong] = useState(SONGS[0]);
  const [currentEmotion, setCurrentEmotion] = useState('happy'); // 감정 인식 연동 전까지 기본값
  const [notes, setNotes] = useState([]);
  
  const videoRef = useRef(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    // 웹캠 연결 시도 및 에러 처리
    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("웹캠을 찾을 수 없거나 권한이 없습니다:", err);
        alert("웹캠 권한을 허용해 주세요!");
      }
    };
    initWebcam();
  }, []);

  const startGame = () => {
    setGameState('playing');
    setNotes([]);
    
    if (selectedSong) {
      audioRef.current.src = selectedSong.url;
      audioRef.current.play().catch(e => console.log("오디오 재생 실패:", e));
    }

    const interval = setInterval(() => {
      const randomEmotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
      setNotes(prev => [...prev, { id: Date.now(), emotion: randomEmotion }]);
    }, 2000);

    audioRef.current.onended = () => {
      clearInterval(interval);
      setGameState('ready');
    };
  };

  return (
    <div className="game-container" style={{ background: '#000', width: '100vw', height: '100vh' }}>
      <video ref={videoRef} autoPlay playsInline className="webcam-bg" 
             style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} />

      {gameState === 'ready' && (
        <div className="overlay" style={{ position: 'relative', zIndex: 10, color: 'white', textAlign: 'center', paddingTop: '20%' }}>
          <h1>Emotion Rhythm Game</h1>
          <button onClick={startGame} style={{ padding: '20px', fontSize: '20px', cursor: 'pointer' }}>
            게임 시작
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="lane-container" style={{ display: 'flex', width: '100%', height: '100%', position: 'absolute', top: 0 }}>
          {EMOTIONS.map((em) => (
            <div key={em} className={`lane ${currentEmotion === em ? 'active' : ''}`} 
                 style={{ flex: 1, border: '1px solid rgba(255,255,255,0.1)', opacity: currentEmotion === em ? 1 : 0.3 }}>
              <div style={{ fontSize: '40px', textAlign: 'center', marginTop: '20px' }}>{EMOJI_MAP[em]}</div>
              {notes.filter(n => n.emotion === em).map(note => (
                <div key={note.id} className="note rising" style={{ position: 'absolute', bottom: '0', fontSize: '40px' }}>
                  {EMOJI_MAP[note.emotion]}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RhythmGame;