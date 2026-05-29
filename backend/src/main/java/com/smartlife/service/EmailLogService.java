package com.smartlife.service;

import com.smartlife.model.EmailLog;
import com.smartlife.repository.EmailLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailLogService {

    private final EmailLogRepository repo;

    public void log(String rawRecipient, String subject, String status, String errorMsg) {
        repo.save(EmailLog.builder()
                .type(detectType(subject))
                .recipient(mask(rawRecipient))
                .status(status)
                .errorMsg(errorMsg)
                .build());
    }

    public List<EmailLog> getRecent() {
        return repo.findTop50ByOrderByCreatedAtDesc();
    }

    public Map<String, Long> getStatusCounts() {
        return Map.of(
                "SENT", repo.countByStatus("SENT"),
                "FAILED", repo.countByStatus("FAILED"),
                "SKIPPED", repo.countByStatus("SKIPPED")
        );
    }

    private String mask(String email) {
        if (email == null || !email.contains("@")) {
            return "***";
        }
        String[] parts = email.split("@", 2);
        String local = parts[0];
        String domain = parts[1];
        if (local.length() <= 1) {
            return local + "***@" + domain;
        }
        return local.charAt(0) + "***@" + domain;
    }

    private String detectType(String subject) {
        String value = subject != null ? subject.toLowerCase(Locale.ROOT) : "";
        if (value.contains("demande") && value.contains("admin")) {
            return "AI_REQUEST_ADMIN";
        }
        if (value.contains("active") || value.contains("accorde")) {
            return "AI_APPROVED";
        }
        if (value.contains("non retenue")) {
            return "AI_REJECTED";
        }
        if (value.contains("otp")) {
            return "OTP";
        }
        return "GENERAL";
    }
}
