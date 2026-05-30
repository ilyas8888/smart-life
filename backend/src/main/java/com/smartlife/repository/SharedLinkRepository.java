package com.smartlife.repository;

import com.smartlife.model.SharedLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SharedLinkRepository extends JpaRepository<SharedLink, Long> {
    List<SharedLink> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    Optional<SharedLink> findByToken(UUID token);
}
