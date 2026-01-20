package com.facebeat.service;

import com.facebeat.entity.Song;
import com.facebeat.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SongService {

    private final SongRepository songRepository;
    private final StorageService storageService;

    @Transactional
    public Song addSong(Song song, MultipartFile songFile, MultipartFile imageFile) {
        // 1. 파일 저장
        String songPath = storageService.store(songFile, "song");
        String imagePath = storageService.store(imageFile, "image");

        // 2. 파일 경로를 엔티티에 설정
        song.setFilePath(songPath);
        song.setImagePath(imagePath);

        // 3. DB에 엔티티 저장
        return songRepository.save(song);
    }

    @Transactional
    public void deleteSong(Long id) {
        // 1. ID로 노래 정보 조회
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid song Id:" + id));

        // 2. 실제 파일 삭제
        storageService.delete(song.getFilePath());
        storageService.delete(song.getImagePath());

        // 3. DB에서 레코드 삭제
        songRepository.delete(song);
    }

    @Transactional(readOnly = true)
    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }
}
