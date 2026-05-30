package com.smartlife.controller;

import com.smartlife.model.SocialPost;
import com.smartlife.model.User;
import com.smartlife.repository.SocialPostRepository;
import com.smartlife.repository.UserRepository;
import com.smartlife.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository      userRepository;
    private final SocialPostRepository postRepository;
    private final BadgeService         badgeService;

    // ── Own profile (private) ────────────────────────────────────────────────

    @GetMapping("/me")
    public Map<String, Object> getMyProfile(@AuthenticationPrincipal User user) {
        List<Map<String, Object>> badges = badgeService.computeAndAward(user);
        return buildProfile(user, badges, true);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user) {

        // Handle (username)
        if (body.containsKey("username")) {
            String handle = sanitizeUsername(body.get("username"));
            if (handle != null && !handle.equals(user.getHandle())) {
                if (userRepository.existsByHandle(handle)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "USERNAME_TAKEN"));
                }
                user.setHandle(handle.isBlank() ? null : handle);
            } else if (handle == null) {
                user.setHandle(null);
            }
        }

        if (body.containsKey("firstName")) {
            String v = trimOrNull(body.get("firstName"));
            user.setFirstName(v);
        }
        if (body.containsKey("lastName")) {
            String v = trimOrNull(body.get("lastName"));
            user.setLastName(v);
        }
        if (body.containsKey("bio")) {
            String bio = trimOrNull(body.get("bio"));
            user.setBio(bio != null && bio.length() > 300 ? bio.substring(0, 300) : bio);
        }
        if (body.containsKey("avatarColor")) {
            String color = trimOrNull(body.get("avatarColor"));
            if (color != null && color.matches("#[0-9A-Fa-f]{6}")) {
                user.setAvatarColor(color);
            }
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(buildProfile(saved, null, true));
    }

    // ── Public profile ────────────────────────────────────────────────────────

    @GetMapping("/{username}")
    public ResponseEntity<?> getPublicProfile(@PathVariable String username,
                                               @AuthenticationPrincipal User currentUser) {
        return userRepository.findByHandle(username)
                .map(target -> {
                    List<SocialPost> posts = postRepository.findByAuthorIdOrderByCreatedAtDesc(target.getId());
                    Map<String, Object> profile = buildProfile(target, null, false);
                    profile.put("postsCount", posts.size());
                    return ResponseEntity.ok(profile);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Public profile by userId (for social feed avatar click) ──────────────

    @GetMapping("/by-id/{userId}")
    public ResponseEntity<?> getProfileById(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .map(target -> {
                    List<Map<String, Object>> badges = badgeService.computeAndAward(target);
                    List<Map<String, Object>> posts  = postRepository.findByAuthorIdOrderByCreatedAtDesc(target.getId())
                            .stream().map(this::toPostSummary).toList();
                    Map<String, Object> profile = buildProfile(target, badges, false);
                    profile.put("posts", posts);
                    return ResponseEntity.ok(profile);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ── My posts (for profile panel) ─────────────────────────────────────────

    @GetMapping("/me/posts")
    public List<Map<String, Object>> getMyPosts(@AuthenticationPrincipal User user) {
        return postRepository.findByAuthorIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toPostSummary).toList();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Map<String, Object> buildProfile(User user, List<Map<String, Object>> badges, boolean includeSensitive) {
        String displayName = (user.getFirstName() != null && !user.getFirstName().isBlank())
                ? (user.getFirstName() + (user.getLastName() != null ? " " + user.getLastName() : "")).trim()
                : user.getEmail().split("@")[0];
        String initials = displayName.length() >= 2
                ? displayName.substring(0, 2).toUpperCase()
                : displayName.toUpperCase();

        Map<String, Object> p = new LinkedHashMap<>();
        p.put("id",          user.getId());
        p.put("username",    user.getHandle());
        p.put("displayName", displayName);
        p.put("initials",    initials);
        p.put("firstName",   user.getFirstName());
        p.put("lastName",    user.getLastName());
        p.put("bio",         user.getBio());
        p.put("avatarColor", user.getAvatarColor() != null ? user.getAvatarColor() : "#6366F1");
        p.put("createdAt",   user.getCreatedAt());
        if (includeSensitive) p.put("email", user.getEmail());
        if (badges != null)   p.put("badges", badges);
        return p;
    }

    private Map<String, Object> toPostSummary(SocialPost post) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",            post.getId());
        m.put("resourceType",  post.getResourceType());
        m.put("title",         post.getTitle());
        m.put("caption",       post.getCaption());
        m.put("reactionsCount",post.getReactionsCount());
        m.put("commentsCount", post.getCommentsCount());
        m.put("savesCount",    post.getSavesCount());
        m.put("createdAt",     post.getCreatedAt());
        return m;
    }

    private String sanitizeUsername(Object raw) {
        if (!(raw instanceof String s)) return null;
        s = s.trim().toLowerCase().replaceAll("[^a-z0-9_]", "");
        return s.length() > 30 ? s.substring(0, 30) : s;
    }

    private String trimOrNull(Object raw) {
        if (!(raw instanceof String s)) return null;
        String t = s.trim();
        return t.isBlank() ? null : t;
    }
}
