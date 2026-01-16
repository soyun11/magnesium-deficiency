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
public class ScoreController {

    private final ScoreService scoreService;

    // 1. 게임 끝났을 때 점수 저장 (POST /api/scores)
    @PostMapping
    public ResponseEntity<String> saveScore(@RequestBody ScoreRequest request) {
        scoreService.saveScore(request);
        return ResponseEntity.ok("점수가 저장되었습니다!");
    }

    // 2. 랭킹 조회 (GET /api/scores/ranking/{songId})
    // 예: /api/scores/ranking/1 -> 1번 곡(Birthday Star) 랭킹 줘
    @GetMapping("/ranking/{songId}")
    public ResponseEntity<List<RankingResponse>> getRanking(@PathVariable Long songId) {
        List<RankingResponse> ranking = scoreService.getRanking(songId);
        return ResponseEntity.ok(ranking);
    }
}