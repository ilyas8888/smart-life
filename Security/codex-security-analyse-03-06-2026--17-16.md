# SmartLife Web Security Report

Scope: web only (`backend/`, `frontend/`, `ai-service/`, web deploy/config). Mobile excluded.

## Phase 1: Threat Model

**Architecture summary:** React SPA on GitHub Pages talks to Spring Boot API on Hugging Face Space. Backend embeds Keycloak/Nginx, uses PostgreSQL/Neon, calls FastAPI AI service via `X-Internal-Key`, and integrates Brevo, USDA, Sentry/OTel, WebSocket STOMP.

**Top 5 assets:**

1. User JWT access tokens and refresh tokens.
2. Personal user data: notes, diary, contacts, food logs, sleep logs, workouts, study sessions.
3. Admin AI entitlement surface: `/api/admin/**`.
4. AI internal secret and Anthropic/Brevo/USDA/VAPID/OTLP secrets.
5. Public share tokens and shared private resources.

**Main trust boundaries:**

1. Browser/local storage -> Spring API.
2. Spring API -> PostgreSQL.
3. Spring API -> FastAPI AI service via `X-Internal-Key`.
4. Spring API/Nginx -> embedded Keycloak.
5. Public unauthenticated endpoints: `/api/auth/**`, `/api/public/shares/**`, `/api/profile/avatar/**`, `/actuator/health`, `/actuator/prometheus`, `/ws`.

**STRIDE highlights:**

| STRIDE | Risk |
|---|---|
| Spoofing | Local login can bypass OTP email verification. |
| Tampering | Stolen refresh token can be replayed because it is plaintext, bearer-style, and not rotated. |
| Repudiation | Audit exists, but refresh replay and OTP failures are not strongly audited. |
| Information disclosure | Public Prometheus endpoint exposes operational metadata; tokens stored in `localStorage`. |
| Denial of service | AI prompt is rate limited, but auth and some public share paths have weaker controls. |
| Elevation of privilege | Admin endpoints rely on entitlement status; generally enforced, but session theft gives full account access. |

## Phase 2: Vulnerability Assessment

### V1. High: OTP verification bypass on local login

Location:
`backend/src/main/java/com/smartlife/service/AuthService.java:47-55`, `59-69`, `76-82`

Issue:
Registration sets `emailVerified(false)` and returns `OTP_REQUIRED` when OTP is enabled, but `login()` does not enforce `emailVerified`. A user can register, ignore OTP, then immediately call `/api/auth/login` and receive tokens.

OWASP/CWE:
OWASP A01 Broken Access Control, A07 Identification and Authentication Failures; CWE-287.

### V2. High: Refresh token replay and client-side token theft risk

Location:
`frontend/src/store/authStore.ts:16-27`, `frontend/src/api/axios.ts:20-29`, `backend/src/main/java/com/smartlife/service/AuthService.java:85-108`, `backend/src/main/java/com/smartlife/model/RefreshToken.java:19-22`

Issue:
Access and refresh tokens are persisted in browser storage under `smartlife-auth`. Any XSS or malicious extension can steal long-lived refresh tokens. Backend stores refresh tokens plaintext and does not rotate or invalidate them on refresh.

OWASP/CWE:
OWASP A02 Cryptographic Failures, A07; CWE-522, CWE-922.

### V3. Medium: OTP generated with `Random`, stored plaintext, no attempt counter

Location:
`backend/src/main/java/com/smartlife/service/OtpService.java:47-54`, `86-94`; `backend/src/main/java/com/smartlife/model/OtpCode.java:21-27`

Issue:
OTP uses `java.util.Random`, stores the code plaintext, and does not throttle failed verification attempts per OTP record.

OWASP/CWE:
OWASP A02/A07; CWE-330, CWE-256, CWE-307.

### V4. Medium: Public Prometheus metrics endpoint

Location:
`backend/src/main/java/com/smartlife/config/SecurityConfig.java:57`, `backend/src/main/resources/application.yml:85-91`

Issue:
`/actuator/prometheus` is unauthenticated. Metrics can leak endpoint names, request volume, timings, dependencies, and operational behavior.

OWASP/CWE:
OWASP A05 Security Misconfiguration; CWE-200, CWE-497.

### V5. Medium: CSV formula injection in admin export

Location:
`backend/src/main/java/com/smartlife/service/AdminUserService.java:37-63`, `95-111`

Issue:
User-controlled fields such as email/firstName/lastName are written to CSV without neutralizing spreadsheet formulas beginning with `=`, `+`, `-`, `@`, tab, or CR.

OWASP/CWE:
OWASP A03 Injection; CWE-1236.

### V6. Medium: Untrusted forwarded headers influence OAuth registration redirect URI

Location:
`backend/src/main/java/com/smartlife/controller/AuthController.java:37-47`

Issue:
`X-Forwarded-Proto` and `X-Forwarded-Host` from the request are used to build `redirect_uri`. If a proxy passes untrusted headers, this can create redirect confusion or phishing flows, especially if Keycloak redirect patterns are broad.

OWASP/CWE:
OWASP A01/A05; CWE-601.

### V7. Low: WebSocket endpoint allows all origins and unauthenticated handshake

Location:
`backend/src/main/java/com/smartlife/config/SecurityConfig.java:58`; `backend/src/main/java/com/smartlife/config/WebSocketConfig.java:37-57`

Issue:
`/ws/**` is permit-all and STOMP endpoint uses `setAllowedOriginPatterns("*")`. CONNECT tries to authenticate, but unauthenticated sessions are not explicitly rejected.

OWASP/CWE:
OWASP A05; CWE-346.

### V8. Low: Avatar upload accepts any `data:image/*`

Location:
`backend/src/main/java/com/smartlife/controller/ProfileController.java:114-130`, `144-158`

Issue:
Any `data:image/` payload is accepted. The download endpoint always serves `image/jpeg`, which reduces script execution risk, but MIME validation is still too loose and can store malformed/polyglot content.

OWASP/CWE:
OWASP A05; CWE-434.

**Positive findings:**

- Most CRUD controllers now enforce ownership checks using `resource.user.id == currentUser.id`.
- Native SQL queries in `FoodCacheRepository` use bound parameters; no direct SQL string concatenation found.
- React does not use `dangerouslySetInnerHTML`; stored text is normally escaped by React.
- `npm audit --omit=dev` returned `0` production vulnerabilities.

## Phase 3: Attack Path & Safe PoC Simulation

### PoC 1: OTP bypass

```powershell
$base = "https://ilyas8888-smartlife-backend.hf.space"
$email = "otp-bypass-test+$([guid]::NewGuid())@example.com"
$body = @{ email=$email; password="StrongPass123!"; firstName="Otp"; lastName="Bypass" } | ConvertTo-Json

Invoke-RestMethod "$base/api/auth/register" -Method Post -ContentType "application/json" -Body $body
# Expected: { step: "OTP_REQUIRED", userId: ... }

$login = @{ email=$email; password="StrongPass123!" } | ConvertTo-Json
Invoke-RestMethod "$base/api/auth/login" -Method Post -ContentType "application/json" -Body $login
# Vulnerable result: returns token + refreshToken before OTP verification.
```

### PoC 2: Refresh token replay

```powershell
$base = "https://ilyas8888-smartlife-backend.hf.space"
# Use a copied refreshToken from browser localStorage key "smartlife-auth".
$refreshToken = "<copied-refresh-token>"

1..3 | ForEach-Object {
  Invoke-RestMethod "$base/api/auth/refresh" `
    -Method Post `
    -ContentType "application/json" `
    -Body (@{ refreshToken=$refreshToken } | ConvertTo-Json)
}
# Vulnerable result: same refresh token can mint repeated access tokens.
```

### PoC 3: Public metrics reconnaissance

```powershell
$base = "https://ilyas8888-smartlife-backend.hf.space"
Invoke-WebRequest "$base/actuator/prometheus" | Select-Object -ExpandProperty Content
# Vulnerable result: unauthenticated operational metrics are returned.
```

## Phase 4: Remediation Plan

### Patch V1: Enforce OTP before local login

```diff
diff --git a/backend/src/main/java/com/smartlife/service/AuthService.java b/backend/src/main/java/com/smartlife/service/AuthService.java
@@
     public Object login(AuthRequest request, String ip) {
         var user = userRepository.findByEmail(request.getEmail())
                 .orElseThrow(() -> new IllegalArgumentException("Email ou mot de passe incorrect"));
         if (!user.isLocalLoginAllowed()) {
             throw new IllegalArgumentException("Connexion locale non autorisee. Utilisez Keycloak.");
         }
         authenticationManager.authenticate(
                 new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
         );
+        if (otpService.isEnabled() && !user.isEmailVerified()) {
+            otpService.generateAndSend(user);
+            auditLogService.log(user.getId(), "LOGIN_OTP_REQUIRED", "USER", user.getId(), ip);
+            return Map.of("step", "OTP_REQUIRED", "userId", user.getId());
+        }
         auditLogService.log(user.getId(), "LOGIN", "USER", user.getId(), ip);
         return authResponse(user);
     }
```

Why secure:
A password alone no longer grants a session when the account still requires email verification.

### Patch V2: Hash and rotate refresh tokens

```diff
diff --git a/backend/src/main/java/com/smartlife/security/JwtService.java b/backend/src/main/java/com/smartlife/security/JwtService.java
@@
 import java.util.UUID;
+import java.security.SecureRandom;
+import java.util.Base64;
@@
     public String generateRefreshToken() {
-        return UUID.randomUUID().toString();
+        byte[] bytes = new byte[32];
+        new SecureRandom().nextBytes(bytes);
+        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
     }
```

```diff
diff --git a/backend/src/main/java/com/smartlife/service/AuthService.java b/backend/src/main/java/com/smartlife/service/AuthService.java
@@
-    public Map<String, String> refresh(String refreshToken) {
-        var token = refreshTokenRepository.findByToken(refreshToken)
+    @Transactional
+    public Map<String, String> refresh(String refreshToken) {
+        if (refreshToken == null || refreshToken.isBlank()) {
+            throw new RuntimeException("Refresh token invalide ou expire");
+        }
+        var token = refreshTokenRepository.findByToken(jwtService.hashToken(refreshToken))
                 .orElseThrow(() -> new RuntimeException("Refresh token invalide ou expire"));
         if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
+            refreshTokenRepository.delete(token);
             throw new RuntimeException("Refresh token invalide ou expire");
         }
-        return Map.of("accessToken", jwtService.generateToken(token.getUser()));
+        User user = token.getUser();
+        refreshTokenRepository.delete(token);
+        String nextRefreshToken = jwtService.generateRefreshToken();
+        refreshTokenRepository.save(RefreshToken.builder()
+                .user(user)
+                .token(jwtService.hashToken(nextRefreshToken))
+                .expiresAt(LocalDateTime.now().plusDays(7))
+                .build());
+        return Map.of(
+                "accessToken", jwtService.generateToken(user),
+                "refreshToken", nextRefreshToken
+        );
@@
-        refreshTokenRepository.save(RefreshToken.builder()
+        refreshTokenRepository.save(RefreshToken.builder()
                 .user(user)
-                .token(refreshToken)
+                .token(jwtService.hashToken(refreshToken))
                 .expiresAt(LocalDateTime.now().plusDays(7))
                 .build());
```

```diff
diff --git a/frontend/src/api/axios.ts b/frontend/src/api/axios.ts
@@
-      const { refreshToken, setToken, logout } = useAuthStore.getState()
+      const { refreshToken, setAuth, email, firstName, lastName, logout } = useAuthStore.getState()
@@
         const { data } = await axios.post(`${import.meta.env.VITE_API_URL ?? ''}/api/auth/refresh`, { refreshToken })
-        setToken(data.accessToken)
+        setAuth(data.accessToken, data.refreshToken ?? refreshToken, email ?? '', firstName, lastName)
```

Why secure:
Database compromise no longer exposes usable refresh tokens, and replayed old refresh tokens are invalidated after one use.

### Patch V3: Secure OTP generation, hashing, and attempt limits

```diff
diff --git a/backend/src/main/java/com/smartlife/model/OtpCode.java b/backend/src/main/java/com/smartlife/model/OtpCode.java
@@
-    private String code;
+    private String codeHash;
+
+    @Builder.Default
+    @Column(nullable = false)
+    private int attempts = 0;
```

```diff
diff --git a/backend/src/main/resources/db/migration/V41__secure_otp_codes.sql b/backend/src/main/resources/db/migration/V41__secure_otp_codes.sql
new file mode 100644
+ALTER TABLE otp_codes ADD COLUMN code_hash VARCHAR(64);
+ALTER TABLE otp_codes ADD COLUMN attempts INT NOT NULL DEFAULT 0;
+UPDATE otp_codes SET code_hash = encode(sha256(code::bytea), 'hex') WHERE code_hash IS NULL;
+ALTER TABLE otp_codes ALTER COLUMN code_hash SET NOT NULL;
+ALTER TABLE otp_codes DROP COLUMN code;
```

```diff
diff --git a/backend/src/main/java/com/smartlife/service/OtpService.java b/backend/src/main/java/com/smartlife/service/OtpService.java
@@
-import java.util.Random;
+import java.security.SecureRandom;
+import java.security.MessageDigest;
+import java.nio.charset.StandardCharsets;
@@
-        String code = String.format("%06d", new Random().nextInt(1_000_000));
+        String code = String.format("%06d", new SecureRandom().nextInt(1_000_000));
         otpRepository.save(OtpCode.builder()
                 .userId(user.getId())
-                .code(code)
+                .codeHash(sha256(code))
@@
         if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
             throw new RuntimeException("Code OTP expirÃ©");
         }
-        if (!otp.getCode().equals(code)) {
+        if (otp.getAttempts() >= 5) {
+            throw new RuntimeException("Code OTP invalide");
+        }
+        if (!MessageDigest.isEqual(otp.getCodeHash().getBytes(StandardCharsets.UTF_8), sha256(code).getBytes(StandardCharsets.UTF_8))) {
+            otp.setAttempts(otp.getAttempts() + 1);
+            otpRepository.save(otp);
             throw new RuntimeException("Code OTP invalide");
         }
@@
     }
+
+    private String sha256(String value) {
+        try {
+            byte[] hash = MessageDigest.getInstance("SHA-256")
+                    .digest(value.getBytes(StandardCharsets.UTF_8));
+            StringBuilder sb = new StringBuilder();
+            for (byte b : hash) sb.append(String.format("%02x", b));
+            return sb.toString();
+        } catch (Exception e) {
+            throw new IllegalStateException("OTP hashing failed", e);
+        }
+    }
```

Why secure:
OTP values are unpredictable, not stored plaintext, and brute-force attempts are capped.

### Patch V4: Protect Prometheus

```diff
diff --git a/backend/src/main/java/com/smartlife/config/SecurityConfig.java b/backend/src/main/java/com/smartlife/config/SecurityConfig.java
@@
-                        .requestMatchers("/actuator/health", "/actuator/prometheus").permitAll()
+                        .requestMatchers("/actuator/health").permitAll()
+                        .requestMatchers("/actuator/prometheus").authenticated()
```

```diff
diff --git a/backend/src/main/resources/application.yml b/backend/src/main/resources/application.yml
@@
-        include: health, info, prometheus, metrics
+        include: health, info, prometheus
```

Why secure:
Health remains public, while detailed operational telemetry requires authentication.

### Patch V5: Prevent CSV formula injection

```diff
diff --git a/backend/src/main/java/com/smartlife/service/AdminUserService.java b/backend/src/main/java/com/smartlife/service/AdminUserService.java
@@
-                String s = val.toString().replace("\"", "\"\"");
+                String s = neutralizeCsvFormula(val.toString()).replace("\"", "\"\"");
@@
     }
+
+    private String neutralizeCsvFormula(String value) {
+        if (value == null || value.isBlank()) return value;
+        char first = value.charAt(0);
+        return (first == '=' || first == '+' || first == '-' || first == '@' || first == '\t' || first == '\r')
+                ? "'" + value
+                : value;
+    }
 }
```

Why secure:
Spreadsheet applications treat the cell as literal text instead of executable formula content.

### Patch V6: Stop trusting forwarded host in OAuth redirect builder

```diff
diff --git a/backend/src/main/java/com/smartlife/controller/AuthController.java b/backend/src/main/java/com/smartlife/controller/AuthController.java
@@
     @Value("${KEYCLOAK_CLIENT_ID:smartlife-backend}")
     private String keycloakClientId;
+
+    @Value("${app.public-backend-url:https://ilyas8888-smartlife-backend.hf.space}")
+    private String publicBackendUrl;
@@
-        String scheme = request.getHeader("X-Forwarded-Proto") != null ? request.getHeader("X-Forwarded-Proto") : request.getScheme();
-        String host = request.getHeader("X-Forwarded-Host") != null ? request.getHeader("X-Forwarded-Host") : request.getServerName();
-        String redirectUri = scheme + "://" + host + "/login/oauth2/code/keycloak";
+        String redirectUri = publicBackendUrl.replaceAll("/+$", "") + "/login/oauth2/code/keycloak";
```

Why secure:
Redirect URI is derived from trusted configuration, not attacker-influenced request headers.

### Patch V7: Restrict WebSocket origin and reject unauthenticated CONNECT

```diff
diff --git a/backend/src/main/java/com/smartlife/config/WebSocketConfig.java b/backend/src/main/java/com/smartlife/config/WebSocketConfig.java
@@
 import org.springframework.context.annotation.Configuration;
+import org.springframework.beans.factory.annotation.Value;
+import org.springframework.messaging.MessageDeliveryException;
@@
     private final JwtService jwtService;
     private final CustomUserDetailsService userDetailsService;
+
+    @Value("${app.frontend-origin:https://ilyas8888.github.io}")
+    private String frontendOrigin;
@@
-        registry.addEndpoint("/ws").setAllowedOriginPatterns("*");
+        registry.addEndpoint("/ws").setAllowedOrigins(frontendOrigin);
@@
-                    }
+                    }
+                    if (accessor.getUser() == null) {
+                        throw new MessageDeliveryException("Unauthenticated WebSocket CONNECT");
+                    }
                 }
```

Why secure:
Only the deployed frontend origin can open the socket, and unauthenticated STOMP sessions are rejected.

### Patch V8: Validate avatar MIME types

```diff
diff --git a/backend/src/main/java/com/smartlife/controller/ProfileController.java b/backend/src/main/java/com/smartlife/controller/ProfileController.java
@@
-        if (avatarData == null || !avatarData.startsWith("data:image/")) {
+        if (avatarData == null || !avatarData.matches("^data:image/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$")) {
             return ResponseEntity.badRequest().body(Map.of("error", "INVALID_IMAGE"));
         }
```

Why secure:
Only expected raster image formats are accepted, reducing malformed or active-content upload risk.

## Priority Order

1. Fix V1 immediately: OTP bypass is a direct auth control failure.
2. Fix V2 next: token replay/localStorage compromise has high blast radius.
3. Fix V3 with V1 if possible: OTP should be secure end-to-end.
4. Lock down V4 before production observability expands.
5. Apply V5-V8 as hardening in the same security sprint.
