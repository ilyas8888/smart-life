package com.smartlife.controller;

import com.smartlife.model.Note;
import com.smartlife.model.User;
import com.smartlife.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteRepository noteRepository;

    @GetMapping
    public List<Note> getNotes(@AuthenticationPrincipal User user) {
        return noteRepository.findByUserIdOrderByIsPinnedDescCreatedAtDesc(user.getId());
    }

    @PostMapping
    public ResponseEntity<Note> createNote(@RequestBody Map<String, Object> body,
                                           @AuthenticationPrincipal User user) {
        Note note = Note.builder()
                .user(user)
                .title((String) body.get("title"))
                .content((String) body.get("content"))
                .isPinned(Boolean.TRUE.equals(body.get("isPinned")))
                .build();
        return ResponseEntity.ok(noteRepository.save(note));
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
