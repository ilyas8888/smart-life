package com.smartlife.controller;

import com.smartlife.model.DiaryEntry;
import com.smartlife.model.User;
import com.smartlife.repository.DiaryEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/diary")
@RequiredArgsConstructor
public class DiaryEntryController {

    private final DiaryEntryRepository diaryEntryRepository;

    @GetMapping
    public List<DiaryEntry> getEntries(@AuthenticationPrincipal User user) {
        return diaryEntryRepository.findByUserIdOrderByEntryDateDesc(user.getId());
    }

    @PostMapping
    public ResponseEntity<DiaryEntry> createEntry(@RequestBody Map<String, String> body,
                                                   @AuthenticationPrincipal User user) {
        DiaryEntry entry = DiaryEntry.builder()
                .user(user)
                .content(body.get("content"))
                .mood(body.get("mood"))
                .build();
        return ResponseEntity.ok(diaryEntryRepository.save(entry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return diaryEntryRepository.findById(id)
                .filter(e -> e.getUser().getId().equals(user.getId()))
                .map(e -> { diaryEntryRepository.delete(e); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiaryEntry> updateEntry(@PathVariable Long id,
                                                   @RequestBody Map<String, String> body,
                                                   @AuthenticationPrincipal User user) {
        return diaryEntryRepository.findById(id)
                .filter(e -> e.getUser().getId().equals(user.getId()))
                .map(e -> {
                    if (body.containsKey("content")) e.setContent(body.get("content"));
                    if (body.containsKey("mood")) e.setMood(body.get("mood"));
                    return ResponseEntity.ok(diaryEntryRepository.save(e));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
