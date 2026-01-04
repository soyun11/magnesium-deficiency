package com.facebeat.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Song {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String artist;
    private int bpm;
    private int difficulty; // 1~5 등

    // 곡에 포함된 노트들 (양방향 매핑)
    @OneToMany(mappedBy = "song", cascade = CascadeType.ALL)
    private List<SongNote> notes;
}