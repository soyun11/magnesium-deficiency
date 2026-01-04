package com.facebeat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/scores")
public class ScoreController {
    
    // 점수 제출 API
    @PostMapping
    public ResponseEntity<String> submitScore(@RequestBody Object scoreDto, Principal principal) {
        // principal.getName()으로 현재 로그인한 유저 ID 획득 가능
        // 점수 저장 로직 구현
        return ResponseEntity.ok("점수 저장 완료");
    }

    // 랭킹 조회 API
    @GetMapping("/ranking/{songId}")
    public ResponseEntity<String> getRanking(@PathVariable Long songId) {
        // 랭킹 조회 로직
        return ResponseEntity.ok("랭킹 리스트 반환");
    }
}
