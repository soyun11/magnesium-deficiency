package com.facebeat.dto.response;

import com.facebeat.entity.Score;
import lombok.Getter;

@Getter
public class RankingResponse {
    private int rank;         // 등수 (1등, 2등...)
    private String userId;
    private String username;  // 유저 이름
    private int score;        // 점수
    private int combo;        // 콤보
    private String grade;     // 등급

    public RankingResponse(int rank, Score score) {
        this.rank = rank;
        this.userId = score.getUser().getUserId();
        this.username = score.getUser().getUsername(); // User 엔티티에서 이름 꺼내기
        this.score = score.getScore();
        this.combo = score.getCombo();
        this.grade = score.getGrade();
    }
}