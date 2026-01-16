package com.facebeat.service;

import com.facebeat.dto.request.ScoreRequest;
import com.facebeat.dto.response.RankingResponse;
import com.facebeat.entity.Score;
import com.facebeat.entity.Song;
import com.facebeat.entity.User;
import com.facebeat.repository.ScoreRepository;
import com.facebeat.repository.SongRepository; // SongRepository 필요
import com.facebeat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScoreService {

    private final ScoreRepository scoreRepository;
    private final UserRepository userRepository;
    private final SongRepository songRepository; // SongRepository가 없으면 만들어야 함!

    // 1. 점수 저장하기
    @Transactional
    public void saveScore(ScoreRequest request) {
        // 유저 찾기
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));

        // 노래 찾기
        Song song = songRepository.findById(request.getSongId())
                .orElseThrow(() -> new IllegalArgumentException("노래를 찾을 수 없습니다."));

        // 점수 객체 생성
        Score score = Score.builder()
                .user(user)
                .song(song)
                .scoreValue(request.getScore())
                .combo(request.getCombo())
                .grade(request.getGrade())
                .build();

        // 저장!
        scoreRepository.save(score);
    }

    // 2. 랭킹 조회하기
    @Transactional(readOnly = true)
    public List<RankingResponse> getRanking(Long songId) {
        // DB에서 점수 높은 순으로 10개 가져오기
        List<Score> scores = scoreRepository.findTop10BySongIdOrderByScoreValueDesc(songId);

        // 랭킹 번호표 붙여서 내보내기
        List<RankingResponse> responseList = new ArrayList<>();
        for (int i = 0; i < scores.size(); i++) {
            // i는 0부터 시작하니까 +1 해서 등수(1등, 2등...) 매김
            responseList.add(new RankingResponse(i + 1, scores.get(i)));
        }

        return responseList;
    }
}