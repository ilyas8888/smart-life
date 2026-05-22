package com.smartlife.config;

import com.smartlife.security.CookieOAuth2AuthorizationRequestRepository;
import com.smartlife.security.CustomUserDetailsService;
import com.smartlife.security.JwtAuthFilter;
import com.smartlife.security.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    @Autowired(required = false)
    private OAuth2SuccessHandler oauth2SuccessHandler;
    @Autowired(required = false)
    private ClientRegistrationRepository clientRegistrationRepository;
    @Autowired(required = false)
    private CookieOAuth2AuthorizationRequestRepository cookieAuthRequestRepo;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/oauth2/**", "/login/oauth2/**", "/login").permitAll()
                        .requestMatchers("/api/auth/refresh").permitAll()
                        .requestMatchers("/api/auth/logout").authenticated()
                        .requestMatchers("/api/auth/**").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\"}");
                        })
                );

        if (clientRegistrationRepository != null) {
            http.oauth2Login(oauth2 -> {
                if (oauth2SuccessHandler != null) oauth2.successHandler(oauth2SuccessHandler);
                oauth2.failureHandler((req, res, ex) -> {
                    String frontendUrl = System.getenv("FRONTEND_URL") != null ? System.getenv("FRONTEND_URL") : "http://localhost:5173";
                    res.sendRedirect(frontendUrl + "?keycloak_error=1");
                });
                oauth2.authorizationEndpoint(a -> {
                    a.authorizationRequestResolver(keycloakRequestResolver(clientRegistrationRepository));
                    if (cookieAuthRequestRepo != null) {
                        a.authorizationRequestRepository(cookieAuthRequestRepo);
                    }
                });
            });
        }

        return http.build();
    }

    @Bean
    public OAuth2AuthorizationRequestResolver keycloakRequestResolver(ClientRegistrationRepository repo) {
        DefaultOAuth2AuthorizationRequestResolver resolver =
                new DefaultOAuth2AuthorizationRequestResolver(repo, "/oauth2/authorization");
        resolver.setAuthorizationRequestCustomizer(customizer ->
            customizer.additionalParameters(params -> {
                if ("register".equals(params.get("kc_action"))) {
                    params.put("prompt", "create");
                    params.remove("kc_action");
                }
            })
        );
        return resolver;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = new java.util.ArrayList<>(List.of("http://localhost:5173", "http://localhost:3000"));
        String prodOrigin = System.getenv("FRONTEND_URL");
        if (prodOrigin != null && !prodOrigin.isBlank()) origins.add(prodOrigin);
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        var provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
