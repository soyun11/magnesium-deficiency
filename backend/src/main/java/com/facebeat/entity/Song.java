package com.facebeat.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "music")
public class Song {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String artist;

    @Column(name = "file_path", nullable = false)
    private String file_path;

    private Integer bpm;
    private Integer duration;
    private Integer difficulty;
    private String image_path;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime created_at;

    public Song() {}

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getArtist() { return artist; }
    public String getFile_path() { return file_path; }
    public Integer getBpm() { return bpm; }
    public Integer getDuration() { return duration; }
    public Integer getDifficulty() { return difficulty; }
    public LocalDateTime getCreated_at() { return created_at; }
    public String getImage_path() { return image_path; }

    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setArtist(String artist) { this.artist = artist; }
    public void setFile_path(String file_path) { this.file_path = file_path; }
    public void setBpm(Integer bpm) { this.bpm = bpm; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public void setDifficulty(Integer difficulty) { this.difficulty = difficulty; }
    public void setImage_path(String image_path) { this.image_path = image_path; }
}
