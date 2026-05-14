package com.smartlife.controller;

import com.smartlife.model.Contact;
import com.smartlife.model.User;
import com.smartlife.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactRepository contactRepository;

    @GetMapping
    public List<Contact> getContacts(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return contactRepository.findByUserIdAndNameContainingIgnoreCase(user.getId(), search);
        }
        return contactRepository.findByUserIdOrderByNameAsc(user.getId());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return contactRepository.findById(id)
                .filter(c -> c.getUser().getId().equals(user.getId()))
                .map(c -> { contactRepository.delete(c); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().<Void>build());
    }
}
