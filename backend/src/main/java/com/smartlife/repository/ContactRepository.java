package com.smartlife.repository;

import com.smartlife.model.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactRepository extends JpaRepository<Contact, Long> {
    List<Contact> findByUserIdOrderByNameAsc(Long userId);
    List<Contact> findByUserIdAndNameContainingIgnoreCase(Long userId, String name);
}
