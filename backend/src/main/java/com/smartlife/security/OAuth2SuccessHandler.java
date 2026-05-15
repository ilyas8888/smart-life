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
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
        String email = oidcUser.getEmail();
        String firstName = oidcUser.getGivenName() != null ? oidcUser.getGivenName() : "";
        String lastName = oidcUser.getFamilyName() != null ? oidcUser.getFamilyName() : "";

        boolean isNewUser = !userRepository.existsByEmail(email);

        User user = userRepository.findByEmail(email).orElseGet(() ->
                userRepository.save(User.builder()
                        .email(email)
                        .password(UUID.randomUUID().toString())
                        .firstName(firstName)
                        .lastName(lastName)
                        .provider("KEYCLOAK")
                        .emailVerified(false)
                        .build())
        );

        if (!isNewUser && user.isEmailVerified()) {
            String accessToken = jwtService.generateToken(user);
            String refreshToken = UUID.randomUUID().toString();
            refreshTokenRepository.save(RefreshToken.builder()
                    .user(user)
                    .token(refreshToken)
                    .expiresAt(LocalDateTime.now().plusDays(7))
                    .build());
            String redirectUrl = "http://localhost:5173/oauth2/callback?token=" + accessToken
                    + "&refreshToken=" + refreshToken
                    + "&email=" + email
                    + "&firstName=" + firstName
                    + "&lastName=" + lastName;
            invalidateSession(request);
            response.sendRedirect(redirectUrl);
        } else {
            otpService.generateAndSend(user);
            invalidateSession(request);
            response.sendRedirect("http://localhost:5173/oauth2/otp?userId=" + user.getId());
        }
    }

    private void invalidateSession(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
    }
}
