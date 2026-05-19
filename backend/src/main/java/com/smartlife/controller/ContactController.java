package com.smartlife.controller;

import com.smartlife.model.Contact;
import com.smartlife.model.User;
import com.smartlife.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @PostMapping
    public ResponseEntity<Contact> createContact(@RequestBody Map<String, Object> body,
                                                 @AuthenticationPrincipal User user) {
        Contact contact = Contact.builder()
                .user(user)
                .name((String) body.get("name"))
                .phone((String) body.get("phone"))
                .email((String) body.get("email"))
                .address((String) body.get("address"))
                .notes((String) body.get("notes"))
                .build();
        return ResponseEntity.ok(contactRepository.save(contact));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contact> updateContact(@PathVariable Long id,
                                                 @RequestBody Map<String, Object> body,
                                                 @AuthenticationPrincipal User user) {
        return contactRepository.findById(id)
                .filter(c -> c.getUser().getId().equals(user.getId()))
                .map(c -> {
                    if (body.containsKey("name")) c.setName((String) body.get("name"));
                    if (body.containsKey("phone")) c.setPhone((String) body.get("phone"));
                    if (body.containsKey("email")) c.setEmail((String) body.get("email"));
                    if (body.containsKey("address")) c.setAddress((String) body.get("address"));
                    if (body.containsKey("notes")) c.setNotes((String) body.get("notes"));
                    return ResponseEntity.ok(contactRepository.save(c));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return contactRepository.findById(id)
                .filter(c -> c.getUser().getId().equals(user.getId()))
                .map(c -> { contactRepository.delete(c); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().<Void>build());
    }
}
