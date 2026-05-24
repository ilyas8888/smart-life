package com.smartlife.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;

/**
 * Active uniquement en prod. Construit le ClientRegistration manuellement
 * pour éviter le OIDC discovery à partir de localhost:8180 — Keycloak
 * retourne "issuer: https://..." dans son discovery doc, ce qui fait échouer
 * la validation de Spring Security quand l'issuer-uri est http://localhost.
 */
@Configuration
@Profile("prod")
public class KeycloakClientConfig {

    @Value("${KEYCLOAK_CLIENT_ID:smartlife-backend}")
    private String clientId;

    @Value("${KEYCLOAK_CLIENT_SECRET:change-me}")
    private String clientSecret;

    @Value("${KC_HOSTNAME:ilyas8888-smartlife-backend.hf.space}")
    private String kcHostname;

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        ClientRegistration registration = ClientRegistration.withRegistrationId("keycloak")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("https://" + kcHostname + "/login/oauth2/code/keycloak")
                .scope("openid", "profile", "email")
                // Public URL — navigateur utilisateur
                .authorizationUri("https://" + kcHostname + "/realms/smartlife/protocol/openid-connect/auth")
                // Internal URLs — échanges serveur→serveur, pas de loopback réseau
                .tokenUri("http://localhost:8180/realms/smartlife/protocol/openid-connect/token")
                .userInfoUri("http://localhost:8180/realms/smartlife/protocol/openid-connect/userinfo")
                .jwkSetUri("http://localhost:8180/realms/smartlife/protocol/openid-connect/certs")
                .userNameAttributeName("sub")
                .clientName("Keycloak")
                .build();
        return new InMemoryClientRegistrationRepository(registration);
    }
}
