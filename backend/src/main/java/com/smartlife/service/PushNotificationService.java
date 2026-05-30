package com.smartlife.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlife.model.PushSubscription;
import com.smartlife.repository.PushSubscriptionRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Security;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PushNotificationService {

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final ObjectMapper objectMapper;

    @Value("${vapid.public-key:}")
    private String vapidPublicKey;

    @Value("${vapid.private-key:}")
    private String vapidPrivateKey;

    @Value("${vapid.subject:mailto:admin@smartlife.app}")
    private String vapidSubject;

    private PushService pushService;

    @PostConstruct
    void init() {
        Security.addProvider(new BouncyCastleProvider());
        if (!vapidPublicKey.isBlank() && !vapidPrivateKey.isBlank()) {
            try {
                pushService = new PushService(vapidPublicKey, vapidPrivateKey, vapidSubject);
                log.info("VAPID push service initialized");
            } catch (Exception e) {
                log.error("Failed to initialize VAPID push service — push notifications disabled", e);
            }
        } else {
            log.warn("VAPID keys not configured — push notifications disabled");
        }
    }

    public boolean isConfigured() {
        return pushService != null;
    }

    @Transactional
    public void sendToUser(Long userId, String title, String body, String url) {
        if (pushService == null) return;

        List<PushSubscription> subs = pushSubscriptionRepository.findByUserId(userId);
        if (subs.isEmpty()) return;

        String payload = buildPayload(title, body, url);

        for (PushSubscription sub : subs) {
            try {
                Notification notification = new Notification(
                        sub.getEndpoint(),
                        sub.getP256dh(),
                        sub.getAuth(),
                        payload.getBytes()
                );
                var response = pushService.send(notification);
                int status = response.getStatusLine().getStatusCode();

                if (status == 410 || status == 404) {
                    // Subscription expired or invalid — remove it
                    pushSubscriptionRepository.delete(sub);
                    log.debug("Removed expired push subscription {} for user {}", sub.getId(), userId);
                }
            } catch (Exception e) {
                log.warn("Failed to send push to subscription {} (user {})", sub.getId(), userId, e);
            }
        }
    }

    private String buildPayload(String title, String body, String url) {
        try {
            return objectMapper.writeValueAsString(Map.of(
                    "title", title,
                    "body",  body,
                    "url",   url,
                    "icon",  "/smart-life/smartlife-icon.svg"
            ));
        } catch (Exception e) {
            return "{\"title\":\"SmartLife\",\"body\":\"Vous avez un rappel\"}";
        }
    }
}
