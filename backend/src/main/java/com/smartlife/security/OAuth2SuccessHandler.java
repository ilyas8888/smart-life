package com.smartlife.security;

import com.smartlife.model.RefreshToken;
import com.smartlife.model.User;
import com.smartlife.repository.RefreshTokenRepository;
import com.smartlife.repository.UserRepository;
import com.smartlife.service.OtpService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private static final BCryptPasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpService otpService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
        String email = oidcUser.getEmail();
        String firstName = oidcUser.getGivenName() != null ? oidcUser.getGivenName() : "";
        String lastName = oidcUser.getFamilyName() != null ? oidcUser.getFamilyName() : "";
        String frontendUrl = System.getenv("FRONTEND_URL") != null ? System.getenv("FRONTEND_URL") : "http://localhost:5173";

        User user = userRepository.findByEmail(email).orElseGet(() ->
                userRepository.save(User.builder()
                        .email(email)
                        .password(PASSWORD_ENCODER.encode(UUID.randomUUID().toString()))
                        .firstName(firstName)
                        .lastName(lastName)
                        .provider("KEYCLOAK")
                        .emailVerified(false)
                        .build())
        );

        if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
            userRepository.save(user);
        }

        String accessToken = jwtService.generateToken(user);
        String refreshToken = UUID.randomUUID().toString();
        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build());
        otpService.sendOAuth2LoginNotification(user, clientIp(request));
        String redirectUrl = frontendUrl + "/oauth2/callback?token=" + accessToken
                + "&refreshToken=" + refreshToken
                + "&email=" + email
                + "&firstName=" + firstName
                + "&lastName=" + lastName;
        invalidateSession(request);
        response.sendRedirect(redirectUrl);
    }

    private void invalidateSession(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
