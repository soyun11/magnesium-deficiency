package com.facebeat.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
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

    private Integer score;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime created_at;

    public Score() {}

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Song getSong() { return song; }
    public Integer getScore() { return score; }
    public LocalDateTime getCreated_at() { return created_at; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setSong(Song song) { this.song = song; }
    public void setScore(Integer score) { this.score = score; }
}
