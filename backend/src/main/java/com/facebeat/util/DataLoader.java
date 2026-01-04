package com.facebeat.util;

import com.facebeat.entity.Song;
import com.facebeat.entity.SongNote;
import com.facebeat.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final SongRepository songRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // DB에 곡이 하나도 없으면 테스트 곡 추가
        if (songRepository.count() == 0) {
            Song testSong = Song.builder()
                    .title("Test Song - Happy Face")
                    .artist("FaceBeat Team")
                    .bpm(120)
                    .difficulty(1)
                    .build();

            // 노트 생성 (타이밍과 필요한 표정)
            List<SongNote> notes = new ArrayList<>();
            
            // 2초에 웃기, 4초에 놀라기, 6초에 웃기
            notes.add(SongNote.builder().song(testSong).timing(2.0).expectedExpression(SongNote.ExpressionType.HAPPY).build());
            notes.add(SongNote.builder().song(testSong).timing(4.0).expectedExpression(SongNote.ExpressionType.SURPRISED).build());
            notes.add(SongNote.builder().song(testSong).timing(6.0).expectedExpression(SongNote.ExpressionType.HAPPY).build());

            testSong.setNotes(notes);

            songRepository.save(testSong);
            System.out.println("========== 테스트용 노래 데이터가 생성되었습니다 ==========");
        }
    }
}