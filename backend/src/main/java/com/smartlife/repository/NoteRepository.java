package com.smartlife.repository;

import com.smartlife.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserIdOrderByIsPinnedDescCreatedAtDesc(Long userId);
}
