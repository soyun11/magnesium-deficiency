package com.facebeat.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RankingResponse {
    // 프론트엔드에서 item.userId로 사용함
    private String userId; 
    
    // 프론트엔드에서 item.songTitle로 사용함
    private String songTitle; 
    
    // 프론트엔드에서 item.score로 사용함
    private int score;
}