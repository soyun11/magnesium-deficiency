package com.facebeat.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ScoreRequest {
    private Long userId;   // 누가 (테스트를 위해 ID를 직접 받음)
    private Long songId;   // 어떤 노래
    private int score;     // 점수
    private int combo;     // 콤보
    private String grade;  // 등급
}