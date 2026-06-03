package com.smartlife.service;

import com.smartlife.dto.AuthRequest;
import com.smartlife.dto.AuthResponse;
import com.smartlife.dto.RegisterRequest;
import com.smartlife.model.RefreshToken;
import com.smartlife.model.RevokedToken;
import com.smartlife.model.User;
import com.smartlife.repository.RefreshTokenRepository;
import com.smartlife.repository.RevokedTokenRepository;
import com.smartlife.repository.UserRepository;
import com.smartlife.security.JwtService;
import io.micrometer.observation.annotation.Observed;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RevokedTokenRepository revokedTokenRepository;
    private final AuditLogService auditLogService;
    private final OtpService otpService;
    private final KeycloakAdminService keycloakAdminService;

    public Object register(RegisterRequest request, String ip) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email deja utilise");
        }
        var user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .emailVerified(false)
                .build();
        userRepository.save(user);
        auditLogService.log(user.getId(), "REGISTER", "USER", user.getId(), ip);
        if (otpService.isEnabled()) {
            otpService.generateAndSend(user);
            return Map.of("step", "OTP_REQUIRED", "userId", user.getId());
        }
        return authResponse(user);
    }

    @Observed(name = "smartlife.auth.login")
    public Object login(AuthRequest request, String ip) {
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email ou mot de passe incorrect"));
        if (!user.isLocalLoginAllowed()) {
            throw new IllegalArgumentException("Connexion locale non autorisee. Utilisez Keycloak.");
        }
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        if (otpService.isEnabled() && !user.isEmailVerified()) {
            otpService.generateAndSend(user);
            auditLogService.log(user.getId(), "LOGIN_OTP_REQUIRED", "USER", user.getId(), ip);
            return Map.of("step", "OTP_REQUIRED", "userId", user.getId());
        }
        auditLogService.log(user.getId(), "LOGIN", "USER", user.getId(), ip);
        return authResponse(user);
    }

    @Observed(name = "smartlife.auth.verify_otp")
    public AuthResponse verifyOtp(Long userId, String code, String ip) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));
        otpService.verify(userId, code);
        user.setEmailVerified(true);
        keycloakAdminService.markEmailVerified(user.getEmail());
        userRepository.save(user);
        auditLogService.log(userId, "OTP_VERIFIED", "USER", userId, ip);
        otpService.sendOAuth2LoginNotification(user, ip);
        return authResponse(user);
    }

    @Transactional
    public Map<String, String> refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new RuntimeException("Refresh token invalide ou expire");
        }
        var token = refreshTokenRepository.findByToken(jwtService.hashToken(refreshToken))
                .orElseThrow(() -> new RuntimeException("Refresh token invalide ou expire"));
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token invalide ou expire");
        }
        var user = token.getUser();
        refreshTokenRepository.delete(token);

        var newRefreshToken = jwtService.generateRefreshToken();
        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .token(jwtService.hashToken(newRefreshToken))
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build());

        return Map.of(
                "accessToken", jwtService.generateToken(user),
                "refreshToken", newRefreshToken
        );
    }

    @Transactional
    public void logout(String accessToken, Long userId, String ip) {
        if (accessToken != null && !accessToken.isBlank()) {
            revokedTokenRepository.save(RevokedToken.builder()
                    .tokenHash(jwtService.hashToken(accessToken))
                    .build());
        }
        refreshTokenRepository.deleteByUserId(userId);
        auditLogService.log(userId, "LOGOUT", "USER", userId, ip);
    }

    private AuthResponse authResponse(User user) {
        var accessToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken();
        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .token(jwtService.hashToken(refreshToken))
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build());
        return new AuthResponse(accessToken, refreshToken, user.getEmail(), user.getFirstName(), user.getLastName());
    }
}
