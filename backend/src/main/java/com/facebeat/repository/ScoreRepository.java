package com.facebeat.repository;

import com.facebeat.entity.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findBySongIdOrderByScoreDesc(Long songId);
}
