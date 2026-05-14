package com.smartlife.controller;

import com.smartlife.model.Note;
import com.smartlife.model.User;
import com.smartlife.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteRepository noteRepository;

    @GetMapping
    public List<Note> getNotes(@AuthenticationPrincipal User user) {
        return noteRepository.findByUserIdOrderByIsPinnedDescCreatedAtDesc(user.getId());
    }

    @PatchMapping("/{id}/pin")
    public ResponseEntity<Note> togglePin(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return noteRepository.findById(id)
                .filter(n -> n.getUser().getId().equals(user.getId()))
                .map(n -> { n.setPinned(!n.isPinned()); return ResponseEntity.ok(noteRepository.save(n)); })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return noteRepository.findById(id)
                .filter(n -> n.getUser().getId().equals(user.getId()))
                .map(n -> { noteRepository.delete(n); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }
}
