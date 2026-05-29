# Codex Prompt — Email Notifications pour AI Access (SmartLife)

## Contexte

Projet SmartLife : Java 17 / Spring Boot 3 / Brevo API pour les emails.
Backend : `backend/src/main/java/com/smartlife/`

Le projet utilise déjà Brevo API dans `OtpService.java` pour envoyer des emails transactionnels.
La configuration Brevo est dans `application.yml` :
- `brevo.api-key: ${BREVO_API_KEY:}`
- `app.mail.from: ${spring.mail.username:}`
- `app.mail.security-alert-recipient: ${SECURITY_ALERT_EMAIL:}` (en prod = `ilyassboulouiz@gmail.com`)

Le système d'accès IA est géré par `AiEntitlementService.java`.
Les événements à notifier :
1. Nouvelle demande d'accès → email à l'admin
2. Demande approuvée → email à l'utilisateur
3. Demande rejetée → email à l'utilisateur

---

## Objectif

Ajouter les notifications email pour les 3 événements du workflow d'accès IA, en réutilisant la mécanique Brevo déjà existante.

---

## Étape 1 — Créer MailService

### Fichier à créer

`backend/src/main/java/com/smartlife/service/MailService.java`

### Responsabilités

- Extraire la logique d'envoi Brevo générique (actuellement dupliquée dans OtpService)
- Exposer une méthode `send(String toEmail, String subject, String textContent)`
- Si `BREVO_API_KEY` ou `fromEmail` est vide → logger seulement, ne pas planter
- Utiliser `@Value` pour injecter `brevo.api-key` et `app.mail.from`

### Implémentation

```java
package com.smartlife.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final ObjectMapper objectMapper;

    @Value("${brevo.api-key:}")
    private String brevoApiKey;

    @Value("${app.mail.from:${spring.mail.username:}}")
    private String fromEmail;

    public void send(String toEmail, String subject, String textContent) {
        if (brevoApiKey.isBlank() || fromEmail.isBlank()) {
            log.info("[MAIL DEV] To: {} | Subject: {} | Body: {}", toEmail, subject, textContent);
            return;
        }
        try {
            String json = objectMapper.writeValueAsString(Map.of(
                    "sender", Map.of("name", "SmartLife", "email", fromEmail),
                    "to", List.of(Map.of("email", toEmail)),
                    "subject", subject,
                    "textContent", textContent
            ));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", brevoApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                log.warn("Brevo API error {}: {}", response.statusCode(), response.body());
            } else {
                log.info("Email envoyé via Brevo à {}", toEmail);
            }
        } catch (Exception e) {
            log.warn("Échec envoi email via Brevo: {}", e.getMessage());
        }
    }
}
```

### Validation

```powershell
mvn -q -DskipTests compile
```

---

## Étape 2 — Modifier AiEntitlementService pour envoyer les emails

### Fichier à modifier

`backend/src/main/java/com/smartlife/service/AiEntitlementService.java`

### Changements

#### 2a. Injecter MailService et la config admin

Ajouter dans la classe :

```java
private final MailService mailService;

@Value("${app.mail.security-alert-recipient:}")
private String adminEmail;
```

#### 2b. Dans `submitRequest()` — notifier l'admin

Après `requestRepository.save(...)`, appeler :

```java
if (!adminEmail.isBlank()) {
    String subject = "[SmartLife] Nouvelle demande d'accès IA";
    String body = "Utilisateur : " + user.getEmail() + "\n"
            + "Message : " + (message != null && !message.isBlank() ? message : "(aucun)") + "\n\n"
            + "Approuver ou rejeter via l'interface admin SmartLife.";
    mailService.send(adminEmail, subject, body);
}
```

#### 2c. Dans `approve()` — notifier l'utilisateur approuvé

Après `entitlementRepository.save(entitlement)`, appeler :

```java
String userEmail = request.getUser().getEmail();
String subject = "[SmartLife] Votre accès au Prompt IA est activé !";
String body = "Bonjour,\n\n"
        + "Votre demande d'accès au Prompt IA SmartLife a été approuvée.\n\n"
        + "Vous pouvez maintenant utiliser l'assistant IA depuis votre tableau de bord.\n\n"
        + "Bonne utilisation !\n— L'équipe SmartLife";
mailService.send(userEmail, subject, body);
```

#### 2d. Dans `reject()` — notifier l'utilisateur rejeté

Après `requestRepository.save(request)`, appeler :

```java
String userEmail = request.getUser().getEmail();
String subject = "[SmartLife] Demande d'accès IA non retenue";
String body = "Bonjour,\n\n"
        + "Votre demande d'accès au Prompt IA n'a pas été retenue pour le moment.\n\n"
        + "Vous pouvez soumettre une nouvelle demande depuis votre tableau de bord.\n\n"
        + "Cordialement,\n— L'équipe SmartLife";
mailService.send(userEmail, subject, body);
```

### Validation

```powershell
mvn -q -DskipTests compile
```

---

## Contraintes

- Ne pas modifier `OtpService.java` — laisser son code en place.
- Ne pas modifier d'autres fichiers que ceux indiqués.
- `MailService.send()` ne doit jamais lancer d'exception vers l'appelant — tout catch interne.
- Java 17 — pas de record, pas de sealed classes si incompatibles.
- Package `com.smartlife.service`.

---

## Résumé des fichiers

| Action | Fichier |
|---|---|
| CRÉER | `service/MailService.java` |
| MODIFIER | `service/AiEntitlementService.java` |
