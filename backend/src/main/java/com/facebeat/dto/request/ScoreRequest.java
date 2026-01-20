package com.facebeat.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty; // 👈 이거 임포트 필수!
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ScoreRequest {

    // [강력 접착제] JSON에서 "userId"라고 온 녀석은 무조건 여기에 넣어라!
    @JsonProperty("userId")
    private String userId;

    @JsonProperty("songId")
    private Long songId;

    @JsonProperty("score")
    private Integer score;
}