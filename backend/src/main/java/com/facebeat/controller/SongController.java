package com.facebeat.controller;

import com.facebeat.entity.Song;
import com.facebeat.service.SongService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173") // React 앱 주소
@RequiredArgsConstructor
public class SongController {

    private final SongService songService;

    @GetMapping("/songs")
    public ResponseEntity<List<Song>> getSongs() {
        List<Song> songs = songService.getAllSongs();
        return ResponseEntity.ok(songs);
    }

    @PostMapping("/songs")
    public ResponseEntity<Song> addSong(
            @RequestParam("title") String title,
            @RequestParam("artist") String artist,
            @RequestParam("bpm") int bpm,
            @RequestParam("difficulty") int difficulty,
            @RequestParam("songFile") MultipartFile songFile,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        Song newSong = new Song();
        newSong.setTitle(title);
        newSong.setArtist(artist);
        newSong.setBpm(bpm);
        newSong.setDifficulty(difficulty);

        Song savedSong = songService.addSong(newSong, songFile, imageFile);
        return new ResponseEntity<>(savedSong, HttpStatus.CREATED);
    }

    @DeleteMapping("/songs/{id}")
    public ResponseEntity<Void> deleteSong(@PathVariable Long id) {
        try {
            songService.deleteSong(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            // ID에 해당하는 노래가 없을 경우
            return ResponseEntity.notFound().build();
        }
    }
}
