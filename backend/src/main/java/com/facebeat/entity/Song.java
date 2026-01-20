package com.facebeat.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "music")
@Getter
@Setter
@NoArgsConstructor
public class Song {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String artist;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "image_path")
    private String imagePath;

    private Integer bpm;

    private Integer difficulty;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

}
