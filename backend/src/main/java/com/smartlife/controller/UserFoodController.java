package com.smartlife.controller;

import com.smartlife.model.User;
import com.smartlife.model.UserFood;
import com.smartlife.repository.UserFoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user-foods")
@RequiredArgsConstructor
public class UserFoodController {

    private final UserFoodRepository userFoodRepository;

    @GetMapping
    public List<Map<String, Object>> getUserFoods() {
        User user = currentUser();
        return userFoodRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping
    public ResponseEntity<?> createUserFood(@RequestBody Map<String, Object> body) {
        User user = currentUser();
        String name = normalizeName(body.get("name"));
        BigDecimal calories = decimalValue(body.get("calories"));
        if (name == null || calories == null || calories.compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "INVALID_USER_FOOD"));
        }

        UserFood food = UserFood.builder()
                .user(user)
                .name(name)
                .calories(calories)
                .proteinG(decimalValue(body.get("proteinG")))
                .carbsG(decimalValue(body.get("carbsG")))
                .fatG(decimalValue(body.get("fatG")))
                .fiberG(decimalValue(body.get("fiberG")))
                .portions(portionsValue(body.get("portions")))
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(userFoodRepository.save(food)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserFood(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User user = currentUser();
        return userFoodRepository.findById(id)
                .map(food -> {
                    if (!food.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                    String name = normalizeName(body.get("name"));
                    BigDecimal calories = decimalValue(body.get("calories"));
                    if (name == null || calories == null || calories.compareTo(BigDecimal.ZERO) < 0) {
                        return ResponseEntity.badRequest().body(Map.of("error", "INVALID_USER_FOOD"));
                    }
                    food.setName(name);
                    food.setCalories(calories);
                    food.setProteinG(decimalValue(body.get("proteinG")));
                    food.setCarbsG(decimalValue(body.get("carbsG")));
                    food.setFatG(decimalValue(body.get("fatG")));
                    food.setFiberG(decimalValue(body.get("fiberG")));
                    food.setPortions(portionsValue(body.get("portions")));
                    food.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(toResponse(userFoodRepository.save(food)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserFood(@PathVariable Long id) {
        User user = currentUser();
        return userFoodRepository.findById(id)
                .map(food -> {
                    if (!food.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build();
                    }
                    userFoodRepository.delete(food);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private User currentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private Map<String, Object> toResponse(UserFood food) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", food.getId());
        response.put("name", food.getName());
        response.put("calories", food.getCalories());
        response.put("proteinG", food.getProteinG());
        response.put("carbsG", food.getCarbsG());
        response.put("fatG", food.getFatG());
        response.put("fiberG", food.getFiberG());
        response.put("portions", food.getPortions());
        response.put("createdAt", food.getCreatedAt());
        return response;
    }

    private String normalizeName(Object rawName) {
        if (!(rawName instanceof String name) || name.isBlank()) {
            return null;
        }
        return name.trim();
    }

    private BigDecimal decimalValue(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        try {
            return BigDecimal.valueOf(Double.parseDouble(String.valueOf(value)));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> portionsValue(Object value) {
        if (value instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return null;
    }
}
