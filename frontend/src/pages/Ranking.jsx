import React from 'react';

const Ranking = ({ data = [] }) => {
  // 데이터가 로딩 중이거나 없을 경우 처리
  if (!data || data.length === 0) {
    return <div className="p-10 text-center">데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-50 p-6 font-sans">
      {/* 헤더 섹션 */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6 px-4">
        <h1 className="text-2xl font-bold text-gray-400">랭킹</h1>
        <div className="flex gap-4 text-gray-500 text-sm">
          <span className="cursor-pointer">홈</span>
          <span className="font-bold text-black border-b-2 border-black cursor-pointer">랭킹</span>
          <span className="cursor-pointer">설정</span>
        </div>
      </div>

      {/* 랭킹 리스트 영역 */}
      <div className="w-full max-w-3xl overflow-y-auto max-h-[80vh] pr-2 scrollbar-hide">
        {data.map((item) => (
          <RankingItem key={`${item.userId}-${item.rank}`} item={item} />
        ))}
      </div>
    </div>
  );
};

const RankingItem = ({ item }) => {
  const isTop = item.rank === 1;

  return (
    <div className={`
      relative flex items-center mb-4 p-4 rounded-[40px] border-4 transition-all duration-200 hover:scale-[1.01]
      ${isTop ? 'border-[#F87171] bg-[#FFF5F5]' : 'border-[#93C5FD] bg-white'}
      shadow-md
    `}>
      {/* 순위 번호 */}
      <div className="flex items-center justify-center w-14 h-14 min-w-[3.5rem] rounded-full bg-white shadow-inner text-2xl font-black mr-6 border border-gray-100">
        {item.rank}
      </div>

      {/* 사용자 아이디 */}
      <div className="flex-1 text-2xl md:text-3xl font-black text-gray-800 truncate mr-4">
        {item.userId}
      </div>

      {/* 곡 제목 및 점수 */}
      <div className="text-right min-w-fit">
        <div className={`text-xs md:text-sm font-bold mb-1 ${isTop ? 'text-red-400' : 'text-blue-400'}`}>
          {item.songTitle}
        </div>
        <div className="flex items-baseline justify-end leading-none">
          <span 
            className="text-4xl md:text-5xl font-black italic tracking-tighter"
            style={{
              color: 'white',
              WebkitTextStroke: isTop ? '2px #F87171' : '2px #60A5FA',
              paintOrder: 'stroke fill',
              filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.1))'
            }}
          >
            {item.score?.toLocaleString()}
          </span>
          <span className="text-lg md:text-xl ml-1 font-bold text-gray-700">점</span>
        </div>
      </div>
    </div>
  );
};

export default Ranking;