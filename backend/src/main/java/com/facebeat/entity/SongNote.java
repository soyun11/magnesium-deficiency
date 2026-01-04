package com.facebeat.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SongNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id")
    private Song song;

    private double timing; // 노트가 등장하는 시간 (초 단위 or 비트)
    
    @Enumerated(EnumType.STRING)
    private ExpressionType expectedExpression; // 요구되는 표정 (HAPPY, SURPRISE 등)

    public enum ExpressionType {
        NEUTRAL, HAPPY, SAD, ANGRY, SURPRISED, FEARFUL, DISGUSTED
    }
}
