package com.smartlife.controller;

import com.smartlife.model.FoodLog;
import com.smartlife.model.User;
import com.smartlife.repository.FoodLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/food-logs")
@RequiredArgsConstructor
public class FoodLogController {

    private final FoodLogRepository foodLogRepository;

    @GetMapping
    public List<FoodLog> getFoodLogs(@AuthenticationPrincipal User user) {
        return foodLogRepository.findByUserIdOrderByLogDateDescLoggedAtDesc(user.getId());
    }

    @GetMapping("/today")
    public List<FoodLog> getTodayFoodLogs(@AuthenticationPrincipal User user) {
        return foodLogRepository.findByUserIdAndLogDate(user.getId(), LocalDate.now());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoodLog(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return foodLogRepository.findById(id)
                .filter(f -> f.getUser().getId().equals(user.getId()))
                .map(f -> { foodLogRepository.delete(f); return ResponseEntity.noContent().<Void>build(); })
                .orElse(ResponseEntity.notFound().build());
    }
}
