package com.facebeat.controller;

import com.facebeat.dto.request.ScoreRequest;
import com.facebeat.dto.response.RankingResponse;
import com.facebeat.service.ScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/scores") // 주소 공통 부분
@CrossOrigin(originPatterns = "*") // 모든 패턴 허용
public class ScoreController {

    private final ScoreService scoreService;

    // 1. 게임 끝났을 때 점수 저장 (POST /api/scores)
    // [수정] DTO 대신 Map을 사용하여 들어오는 모든 데이터를 다 받습니다.
    @PostMapping
    public ResponseEntity<String> saveScore(@RequestBody java.util.Map<String, Object> requestData) {
        
        System.out.println("🔥🔥🔥 [긴급 점검] 데이터 확인: " + requestData);
        
        // 1. [수정] userId를 Long이 아니라 String(문자열)으로 꺼냅니다!
        String userId = String.valueOf(requestData.get("userId")); // "testuser1"
        
        // 2. 나머지는 그대로
        Long songId = Long.valueOf(String.valueOf(requestData.get("songId")));
        Integer score = Integer.valueOf(String.valueOf(requestData.get("score")));

        // 3. DTO에 담기
        ScoreRequest requestDto = new ScoreRequest();
        
        requestDto.setUserId(userId); // 👈 이제 여기 빨간 줄이 사라질 겁니다! (String -> String)
        requestDto.setSongId(songId);
        requestDto.setScore(score);
        
        scoreService.saveScore(requestDto);
        
        return ResponseEntity.ok("점수가 저장되었습니다!");
    }

    // 2. 랭킹 조회 (GET /api/scores/ranking)
    // 예: /api/scores/ranking -> Top 10 랭킹 반환
    @GetMapping("/ranking")
    public ResponseEntity<List<RankingResponse>> getRanking() {
        List<RankingResponse> ranking = scoreService.getTop10Ranking();
        return ResponseEntity.ok(ranking);
    }
}