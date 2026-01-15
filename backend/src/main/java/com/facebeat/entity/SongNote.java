package com.facebeat.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "song_notes")
public class SongNote {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id")
    private Song song;

    // 노트 시간(ms) 같은 용도
    private Integer time_ms;

    // 예: lane(1~4)
    private Integer lane;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime created_at;

    public SongNote() {}

    public Long getId() { return id; }
    public Song getSong() { return song; }
    public Integer getTime_ms() { return time_ms; }
    public Integer getLane() { return lane; }
    public LocalDateTime getCreated_at() { return created_at; }

    public void setId(Long id) { this.id = id; }
    public void setSong(Song song) { this.song = song; }
    public void setTime_ms(Integer time_ms) { this.time_ms = time_ms; }
    public void setLane(Integer lane) { this.lane = lane; }
}