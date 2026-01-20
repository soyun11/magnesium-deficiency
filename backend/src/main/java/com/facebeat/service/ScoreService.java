package com.facebeat.service;

import com.facebeat.dto.request.ScoreRequest; //[추가] 저장 요청 DTO
import com.facebeat.dto.response.RankingResponse;
import com.facebeat.entity.Score;
import com.facebeat.entity.Song; //[추가]
import com.facebeat.entity.User; //[추가]
import com.facebeat.repository.ScoreRepository;
import com.facebeat.repository.SongRepository; //[추가]
import com.facebeat.repository.UserRepository; //[추가]
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScoreService {

    private final ScoreRepository scoreRepository;
    private final UserRepository userRepository; //[추가]
    private final SongRepository songRepository; //[추가]

    /* 1. 점수 저장 기능 추가 */
    @Transactional
    public void saveScore(ScoreRequest request) {
    // 1. 노래 조회 (노래는 그대로 숫자로 찾음)
    Song song = songRepository.findById(request.getSongId())
            .orElseThrow(() -> new IllegalArgumentException("노래가 없습니다."));

    // 2. 점수 엔티티 생성 (여기가 중요!)
    Score score = Score.builder()
            .userId(request.getUserId()) // 👈 [핵심] 이제 String(문자열)을 그대로 넣습니다!
            .song(song)
            .score(request.getScore())
            .build();

    // 3. 저장
    scoreRepository.save(score);
    }
    @Transactional(readOnly = true)
    public List<RankingResponse> getTop10Ranking() {
        // 1. DB에서 데이터 가져오기
        List<Score> scores = scoreRepository.findTop10ByOrderByScoreDescCreatedAtAsc();
        
        List<RankingResponse> responseList = new ArrayList<>();
        
        // 2. DTO로 변환
        for (Score s : scores) {
            responseList.add(RankingResponse.builder()
                .userId(s.getUserId())     // 유저 아이디
                .songTitle(s.getSong().getTitle())   // 🔥 [수정] getSong().getTitle()
                .score(s.getScore())                 // 🔥 [수정] getScore()
                .build());
        }
        
        return responseList;
    }
}