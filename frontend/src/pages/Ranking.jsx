import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = 'http://localhost:8080';

const Ranking = () => {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        // 백엔드에서 랭킹 데이터를 가져옵니다.
        // API는 내부적으로 score_value 기준 DESC 정렬 및 LIMIT 10 처리가 되어 있어야 합니다.
        const response = await fetch(`${BACKEND_URL}/api/scores/ranking`);
        if (!response.ok) throw new Error('데이터 로딩 실패');
        
        const data = await response.json();
        setRankings(data); // data 예시: [{ userId: 'user1', songTitle: '노래1', score: 2500 }, ...]
      } catch (error) {
        console.error("랭킹 호출 에러:", error);
        // 에러 시 보여줄 더미 데이터 (테스트용)
        setRankings([
          { userId: 'Magnesium_Master', songTitle: '생일 축하 노래', score: 3200 },
          { userId: 'Rhythm_King', songTitle: '기본 곡', score: 2800 },
          { userId: 'Face_Expert', songTitle: '생일 축하 노래', score: 2100 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, []);

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#FFF9F9] p-6 font-sans overflow-hidden">
      {/* 배경 장식 (Home과 일관성 유지) */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#F8C4B4] opacity-20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#B4E4F8] opacity-20 rounded-full blur-3xl" />

      {/* 헤더 섹션 (로고 좌측, 메뉴 우측) */}
      <header className="w-full max-w-5xl flex justify-between items-center mb-12 px-4 z-10">
        <h1 
          className="text-2xl font-black text-[#333] cursor-pointer" 
          onClick={() => navigate('/Home')}
        >
          마그네슘 부족
        </h1>
        <div className="flex gap-8 text-sm text-gray-500 font-bold">
          <button onClick={() => navigate('/Home')} className="hover:text-black transition-all">홈</button>
          <button onClick={() => navigate('/Ranking')} className="text-black border-b-2 border-[#F8C4B4] pb-1">랭킹</button>
          <button onClick={() => navigate('/Settings')} className="hover:text-black transition-all">설정</button>
        </div>
      </header>

      {/* 메인 타이틀 */}
      <div className="text-center z-10 mb-10">
        <h2 className="text-5xl font-black text-[#333] tracking-tighter">
          TOP 10 <span className="text-[#F8C4B4]">HALL OF FAME</span>
        </h2>
        <p className="text-gray-400 font-bold mt-2">최고의 표정술사들을 확인하세요</p>
      </div>

      {/* 랭킹 리스트 영역 */}
      <div className="w-full max-w-3xl z-10 overflow-y-auto max-h-[70vh] pr-2 scrollbar-hide">
        {isLoading ? (
          <div className="text-center py-20 font-black text-gray-300 text-2xl animate-pulse">
            RANKING LOADING...
          </div>
        ) : (
          rankings.map((item, index) => (
            <RankingItem 
              key={`${item.userId}-${index}`} 
              item={{ ...item, rank: index + 1 }} 
            />
          ))
        )}
      </div>
    </div>
  );
};

const RankingItem = ({ item }) => {
  const isTop = item.rank === 1;

  return (
    <div className={`
      relative flex items-center mb-5 p-5 rounded-[40px] border-4 transition-all duration-300 hover:scale-[1.02]
      ${isTop ? 'border-[#F8C4B4] bg-white shadow-[0_15px_30px_rgba(248,196,180,0.3)]' : 'border-white bg-white/60 shadow-sm'}
    `}>
      {/* 순위 번호 (Peach 색상 강조) */}
      <div className={`flex items-center justify-center w-16 h-16 min-w-[4rem] rounded-full text-3xl font-black mr-8 shadow-sm
        ${isTop ? 'bg-[#F8C4B4] text-white' : 'bg-gray-100 text-gray-400'}`}>
        {item.rank}
      </div>

      {/* 사용자 아이디 */}
      <div className="flex-1 text-3xl font-black text-[#333] truncate mr-4 tracking-tighter">
        {item.userId}
      </div>

      {/* 곡 제목 및 점수 */}
      <div className="text-right min-w-fit">
        <div className={`text-sm font-black mb-1 ${isTop ? 'text-[#F8C4B4]' : 'text-[#B4E4F8]'}`}>
          {item.songTitle}
        </div>
        <div className="flex items-baseline justify-end leading-none">
          <span 
            className="text-5xl font-black italic tracking-tighter"
            style={{
              color: 'white',
              WebkitTextStroke: isTop ? '2.5px #F8C4B4' : '2.5px #B4E4F8',
              paintOrder: 'stroke fill',
              filter: 'drop-shadow(3px 3px 0px rgba(0,0,0,0.05))'
            }}
          >
            {item.score?.toLocaleString()}
          </span>
          <span className="text-xl ml-1 font-black text-[#333]">점</span>
        </div>
      </div>
    </div>
  );
};

export default Ranking;