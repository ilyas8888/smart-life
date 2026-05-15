package com.smartlife.service;

import com.smartlife.model.OtpCode;
import com.smartlife.model.User;
import com.smartlife.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpRepository otpRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.otp.enabled:false}")
    private boolean otpEnabled;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public boolean isEnabled() {
        return otpEnabled;
    }

    public void generateAndSend(User user) {
        String code = String.format("%06d", new Random().nextInt(1_000_000));
        otpRepository.save(OtpCode.builder()
                .userId(user.getId())
                .code(code)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build());

        if (otpEnabled && mailSender != null && !fromEmail.isBlank()) {
            try {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setTo(user.getEmail());
                msg.setSubject("SmartLife — Code de vérification");
                msg.setText("Votre code SmartLife : " + code + "\n\nValable 10 minutes. Ne le partagez pas.");
                mailSender.send(msg);
            } catch (Exception e) {
                log.warn("Échec envoi email OTP: {}", e.getMessage());
            }
        } else {
            log.info("OTP [DEV] {} → {}", user.getEmail(), code);
        }
    }

    public void verify(Long userId, String code) {
        OtpCode otp = otpRepository.findTopByUserIdAndUsedFalseOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new RuntimeException("Code OTP invalide"));
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Code OTP expiré");
        }
        if (!otp.getCode().equals(code)) {
            throw new RuntimeException("Code OTP invalide");
        }
        otp.setUsed(true);
        otpRepository.save(otp);
    }
}
