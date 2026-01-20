package com.facebeat.service;

import com.facebeat.dto.response.RankingResponse;
import com.facebeat.entity.Score;
import com.facebeat.repository.ScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScoreService {

    private final ScoreRepository scoreRepository;

    @Transactional(readOnly = true)
    public List<RankingResponse> getTop10Ranking() {
        // 1. DB에서 데이터 가져오기
        List<Score> scores = scoreRepository.findTop10ByOrderByScoreDescCreatedAtAsc();
        
        List<RankingResponse> responseList = new ArrayList<>();
        
        // 2. DTO로 변환
        for (Score s : scores) {
            responseList.add(RankingResponse.builder()
                .userId(s.getUser().getUserId())     // 유저 아이디
                .songTitle(s.getSong().getTitle())   // 🔥 [수정] getSong().getTitle()
                .score(s.getScore())                 // 🔥 [수정] getScore()
                .build());
        }
        
        return responseList;
    }
}