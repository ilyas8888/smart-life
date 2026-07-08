 ---
  Analyse de la réponse Codex

  Ce que Codex a trouvé de correct :

  ┌────────────────────────┬─────────┬──────────────────────────────────────────────────────────────────┐
  │        Finding         │ Verdict │                              Détail                              │
  ├────────────────────────┼─────────┼──────────────────────────────────────────────────────────────────┤
  │ WebMvcConfig compile   │         │ WebMvcConfig.java:13 injecte IdempotencyInterceptor — classe     │
  │ error                  │ ✅ RÉEL │ supprimée dans feat/android-mobile. Spring Boot ne démarrera     │
  │                        │         │ pas.                                                             │
  ├────────────────────────┼─────────┼──────────────────────────────────────────────────────────────────┤
  │ Android refresh token  │         │ TokenAuthenticator.kt:55 envoie {"refreshToken":...} dans le     │
  │ mismatch               │ ✅ RÉEL │ body. AuthController.java:91 lit @CookieValue("refreshToken").   │
  │                        │         │ L'Android ne peut jamais rafraîchir un token.                    │
  ├────────────────────────┼─────────┼──────────────────────────────────────────────────────────────────┤
  │                        │         │ User.java default = false. AuthService.register() ne met pas     │
  │ localLoginAllowed non  │ ✅ RÉEL │ .localLoginAllowed(true). login() rejette tout user où c'est     │
  │ défini à l'inscription │         │ false. Tout compte inscrit via /api/auth/register ne peut pas se │
  │                        │         │  connecter.                                                      │
  ├────────────────────────┼─────────┼──────────────────────────────────────────────────────────────────┤
  │ APKs dans Git          │ ✅ RÉEL │ app-debug.apk + app-release.apk trackés — binaires lourds,       │
  │                        │         │ problème de pratique.                                            │
  └────────────────────────┴─────────┴──────────────────────────────────────────────────────────────────┘

  Ce que Codex a mal compris :

  Finding: "Endpoints admin accessibles à tout utilisateur authentifié"
  Verdict: ⚠️ INCOMPLET
  Réalité: La protection admin existe mais pas via @PreAuthorize. Chaque controller admin appelle
    entitlementService.requireAdmin(admin) qui vérifie UserAiEntitlement.status == "ADMIN". Codex n'a pas
    suivi la chaîne d'appel. Le vrai risque : si un nouveau endpoint admin oublie cet appel, il n'y a pas de

    filet.

  Ce que Codex n'a pas vu (et que j'avais trouvé) :
  - Le fichier V41__idempotency_keys.sql est aussi supprimé de la branche → Flyway validation error au
  prochain démarrage si la migration V41 est déjà en DB
  - La sidebar de DashboardPage.tsx utilise des styles inline (pas des classes Tailwind) → non couverts par
  le compatibility bridge du light mode
  - Le fichier tmp_tasks_original.tsx flotte à la racine

  ---
  Prompt pour Codex

  Contexte du projet SmartLife — à lire avant toute intervention

  Tu as analysé ce projet. Je vais corriger certains de tes constats et te donner la
  priorité exacte des corrections à faire.

  ---

  CORRECTION DE TON ANALYSE

  1. Les endpoints admin sont protégés — mais différemment de ce que tu croyais.
     Il n'y a pas de @PreAuthorize, mais chaque controller admin appelle
     entitlementService.requireAdmin(admin) en première ligne, qui vérifie que
     l'entitlement de l'utilisateur est "ADMIN" dans la table user_ai_entitlements.
     C'est une protection applicative, pas Spring Security. Elle fonctionne.
     Le vrai risque résiduel : un futur endpoint admin qui oublierait cet appel
     n'aurait aucun filet. À garder en tête mais pas à corriger maintenant.

  2. L'IdempotencyInterceptor a été supprimé intentionnellement de la branche
     feat/android-mobile, mais WebMvcConfig.java référence encore la classe
     supprimée → erreur de compilation. C'est la correction prioritaire n°1.

  3. La migration V41__idempotency_keys.sql a aussi été supprimée de cette branche.
     En production, V41 est déjà appliquée (V43 est la version actuelle).
     Si V41 reste absente du classpath après le merge, Flyway lancera une
     FlywayValidateException au démarrage ("Detected applied migration not resolved
     locally: 41"). À traiter en même temps que le point 2.

  ---

  CE QUI EST DÉJÀ CORRIGÉ — NE PAS RETOUCHER

  Toute la sécurité du sprint 2026-06-03 est corrigée et déployée en prod :
  - V1 : OTP bypass bloqué
  - V2 : Refresh token SHA-256, HttpOnly cookie, rotation
  - V3 : SecureRandom OTP, hash, 5 tentatives max
  - V4 : /actuator/prometheus → authenticated()
  - V5 : CSV injection neutralisée
  - V6 : OAuth redirect depuis @Value config
  - V7 : WebSocket origine stricte
  - V8 : Avatar regex stricte

  Ne pas re-corriger ces points, ils sont intentionnels et en prod.

  ---

  CE QUI EST EN COURS — NE PAS TOUCHER

  frontend/src/index.css est en cours de refonte (light mode theme).
  Ne pas modifier ce fichier.

  ---

  PRIORITÉS DE CORRECTION (dans l'ordre)

  Priorité 1 — Compile error (bloquant)
  Fichier : backend/src/main/java/com/smartlife/config/WebMvcConfig.java
  Problème : injecte IdempotencyInterceptor qui n'existe plus.
  Fix attendu : supprimer l'injection et l'enregistrement de l'interceptor dans
  addInterceptors(). Le RateLimitInterceptor sur /api/prompt doit rester.

  Priorité 2 — Flyway orphan migration (bloquant au prochain déploiement)
  Problème : V41__idempotency_keys.sql supprimé mais appliqué en DB.
  Fix attendu : recréer un fichier V41__idempotency_keys.sql vide ou avec un
  commentaire, pour que Flyway trouve une résolution locale correspondant au
  checksum de la migration déjà appliquée.
  ATTENTION : si le checksum ne correspond pas, Flyway rejette aussi. Il faut
  soit retrouver le contenu exact original de V41 (il existe dans la branche main
  — lis-le via git show main:backend/src/main/resources/db/migration/V41__idempotency_keys.sql),
  soit utiliser flyway.outOfOrder + flyway.ignoreMigrationPatterns si recréer le
  fichier exact est impossible.

  Priorité 3 — localLoginAllowed non défini à l'inscription (bug critique)
  Fichier : backend/src/main/java/com/smartlife/service/AuthService.java
  Problème : User.builder() à la ligne register() ne met pas .localLoginAllowed(true).
  La colonne a DEFAULT FALSE (V16). login() rejette tout user où c'est false.
  Résultat : chaque nouveau compte inscrit via /api/auth/register ne peut jamais
  se connecter.
  Fix attendu : ajouter .localLoginAllowed(true) dans le builder de register().

  Priorité 4 — Android refresh token (bug mobile)
  Fichier : mobile-android/app/src/main/java/com/smartlife/mobile/core/network/TokenAuthenticator.kt
  Problème : envoie {"refreshToken": ...} dans le body JSON.
  AuthController.java /api/auth/refresh lit uniquement @CookieValue("refreshToken").
  L'Android ne peut jamais rafraîchir un token → déconnecté à chaque expiration.
  Fix attendu : deux options possibles —
    Option A (côté backend, recommandée) : modifier /api/auth/refresh pour lire
    en priorité le body si le cookie est absent,
    ex: @RequestParam(required=false) String refreshToken en body + fallback cookie.
    Option B (côté Android) : stocker le refresh token dans un cookie en utilisant
    un CookieJar OkHttp. Moins propre car Android gère mal les HttpOnly cookies
    inter-process.
    Je préfère l'Option A. Si tu choisis autrement, explique pourquoi.

  Priorité 5 — APKs dans Git
  Fichiers : mobile-android/app/app-debug.apk, mobile-android/app/app-release.apk
  Fix : ajouter *.apk dans .gitignore (à la racine ou dans mobile-android/),
  puis git rm --cached pour désindexer les APKs existants sans les supprimer
  localement.

  ---

  CONTRAINTES IMPORTANTES

  - On est sur la branche feat/android-mobile. Ne pas merger dans main.
  - Ne pas toucher les fichiers de configuration CI/CD (.github/workflows/).
  - Ne pas ajouter de tests pour l'instant (couverture faible connue, hors scope).
  - Pour chaque correction, explique ce que tu as changé et pourquoi,
    en une phrase par fichier modifié.
  - Commence par la Priorité 1 (compile error), confirme, puis attends
    ma permission pour continuer.
