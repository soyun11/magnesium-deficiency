package com.facebeat.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor
@Table(name = "scores")
public class Score {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 [핵심 수정] 객체 연결(@ManyToOne)을 끊고, 단순 문자열 ID로 저장!
    @Column(name = "user_id", nullable = false)
    private String userId;

    // 노래는 여전히 ID(숫자)로 연결 유지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id")
    private Song song;

    @Column(name = "score_value")
    private Integer score;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // 생성자 (서비스에서 저장할 때 사용)
    @Builder
    public Score(String userId, Song song, Integer score) {
        this.userId = userId;
        this.song = song;
        this.score = score;
    }
}