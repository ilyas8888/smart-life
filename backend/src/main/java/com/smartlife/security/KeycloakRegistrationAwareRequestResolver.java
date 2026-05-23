package com.smartlife.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

public class KeycloakRegistrationAwareRequestResolver implements OAuth2AuthorizationRequestResolver {

    private final DefaultOAuth2AuthorizationRequestResolver defaultResolver;

    public KeycloakRegistrationAwareRequestResolver(ClientRegistrationRepository repo) {
        this.defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(repo, "/oauth2/authorization");
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        return toRegistration(defaultResolver.resolve(request), request);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        return toRegistration(defaultResolver.resolve(request, clientRegistrationId), request);
    }

    private OAuth2AuthorizationRequest toRegistration(OAuth2AuthorizationRequest req, HttpServletRequest httpRequest) {
        if (req == null) return null;
        if ("register".equals(httpRequest.getParameter("action"))) {
            String registrationUri = req.getAuthorizationUri()
                    .replace("/protocol/openid-connect/auth", "/protocol/openid-connect/registrations");
            return OAuth2AuthorizationRequest.from(req)
                    .authorizationUri(registrationUri)
                    .build();
        }
        return req;
    }
}
