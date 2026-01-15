package com.facebeat.controller;

import com.facebeat.entity.Song;
import com.facebeat.repository.SongRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173") // Vite 기본 포트
public class SongController {

    private final SongRepository songRepository;

    public SongController(SongRepository songRepository) {
        this.songRepository = songRepository;
    }

    @GetMapping("/songs")
    public List<Song> getSongs() {
        return songRepository.findAll();
    }
}
