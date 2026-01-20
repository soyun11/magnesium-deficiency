package com.facebeat.repository;

import com.facebeat.entity.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, Long> {

    // 🏆 Top 10 랭킹 조회
    // 변수명 변경 반영: s.music -> s.song, s.scoreValue -> s.score
    // JPQL 쿼리 수정
    @Query("SELECT s FROM Score s JOIN FETCH s.song ORDER BY s.score DESC, s.createdAt ASC")
    List<Score> findTop10ByOrderByScoreDescCreatedAtAsc();
}