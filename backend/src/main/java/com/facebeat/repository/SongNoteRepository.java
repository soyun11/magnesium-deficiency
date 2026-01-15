package com.facebeat.repository;

import com.facebeat.entity.SongNote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SongNoteRepository extends JpaRepository<SongNote, Long> {}
