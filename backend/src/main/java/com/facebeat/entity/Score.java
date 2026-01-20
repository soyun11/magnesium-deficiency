package com.facebeat.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor // 기본 생성자 추가
@Table(name = "scores")
public class Score {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 누가
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // 어떤 곡
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id")
    private Song song;

    // 점수
    @Column(name = "score_value")
    private Integer score;

    //[삭제됨] combo, grade 변수 불필요해서 삭제함.

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // 생성자 추가 
    @Builder
    public Score(User user, Song song, Integer score) { //[삭제됨] combo, grade 삭제.
        this.user = user;
        this.song = song;
        this.score = score;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Song getSong() { return song; }
    public Integer getScore() { return score; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setSong(Song song) { this.song = song; }
    public void setScore(Integer score) { this.score = score; }
}
