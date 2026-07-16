# Memo Compact - SmartLife - 2026-06-03

Workspace courant: `C:\My files\My Projects\Smart Life`.
Ne plus utiliser les anciens chemins `C:\Claude\gj` / `C:\Claude\ej` sauf pour lire d'anciennes traces historiques.

## Etat general

- Branche de travail observee precedemment: `feat/android-mobile`.
- La demande courante concerne uniquement la partie web (`backend/`, `frontend/`, `ai-service/`), pas `mobile-android/`.
- Preserver les changements locaux et fichiers non suivis hors scope: `logs/`, `exceptions/`, `analyzes/`, `approches/`, `Security/`, `tmp_tasks_original.tsx`.
- Un rapport de securite complet a ete cree: `Security/codex-security-analyse-03-06-2026--17-16.md`.

## Correctifs securite web deja appliques/verifies

### V1 / OTP

- `backend/src/main/java/com/smartlife/service/AuthService.java`
  - `login()` renvoie `OTP_REQUIRED` si OTP active et `emailVerified=false`.
- `backend/src/main/java/com/smartlife/service/OtpService.java`
  - OTP genere avec `SecureRandom`.
- `backend/src/main/resources/db/migration/V42__secure_otp.sql`
  - Migration OTP existante dans le repo courant.

### V2 / Refresh tokens

- Backend:
  - `JwtService.generateRefreshToken()` utilise maintenant 32 bytes `SecureRandom`.
  - `JwtService.hashToken(String)` existe et sert au SHA-256 hex.
  - `RefreshToken.token` reste le nom de propriete Java, mais est mappe vers colonne DB `token_hash`.
  - `AuthService.authResponse()` stocke le hash du refresh token.
  - `AuthService.refresh()` cherche par hash, supprime l'ancien token, genere un nouveau refresh token, stocke son hash et retourne `accessToken` + `refreshToken`.
  - `OAuth2SuccessHandler` stocke aussi le refresh token hashe.
  - `backend/src/main/resources/db/migration/V43__hash_refresh_tokens.sql` existe car `V42` etait deja pris par OTP.
- Etat plus recent observe:
  - `AuthController` a evolue vers refresh token en cookie HttpOnly:
    - `register/login/verify-otp` posent un cookie `refreshToken`.
    - `/api/auth/refresh` lit `@CookieValue("refreshToken")`, remet un nouveau cookie et ne retourne que `accessToken`.
    - `/api/auth/logout` clear le cookie.
    - `app.cookie.secure` pilote `Secure` + `SameSite=None/Lax`.
  - `frontend/src/api/axios.ts` utilise `withCredentials: true` et un `refreshPromise` global pour eviter les races de rotation.
  - `frontend/src/store/authStore.ts` ne stocke plus `refreshToken`, mais persiste encore `token/email/firstName/lastName` dans `localStorage`.

### V5 / CSV injection

- `backend/src/main/java/com/smartlife/service/AdminUserService.java`
  - Ajout de `neutralizeCsvFormula(String value)`.
  - `csvLine(...)` neutralise les valeurs commencant par `=`, `+`, `-`, `@`, tab ou CR.

### V7 / WebSocket

- `backend/src/main/java/com/smartlife/config/WebSocketConfig.java`
  - Ajout de `@Value("${app.frontend-origin:https://ilyas8888.github.io}")`.
  - Remplacement de `setAllowedOriginPatterns("*")` par `setAllowedOrigins(frontendOrigin)`.
  - Rejet explicite de STOMP `CONNECT` non authentifie avec `MessageDeliveryException("Unauthenticated WebSocket CONNECT")`.
- `backend/src/main/resources/application.yml`
  - Ajout `app.frontend-origin: https://ilyas8888.github.io`.

### V8 / Avatar MIME

- `backend/src/main/java/com/smartlife/controller/ProfileController.java`
  - Remplacement du `startsWith("data:image/")` par:
    `^data:image/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$`

## Verifications effectuees

- Backend compile apres les correctifs demandes:
  - `mvn -q -DskipTests compile` reussi apres V5, V7, V8 et precedemment apres V2.
- Frontend:
  - `npm.cmd run build` reussi pendant l'audit frontend.
  - `npm.cmd run build` reussi apres le correctif light/dark mode.
  - `git diff --check -- frontend/src/index.css frontend/src/pages/DashboardPage.tsx frontend/src/store/themeStore.ts` reussi; seuls warnings CRLF Windows.

## Correctif frontend light/dark mode applique

Demande traitee apres analyse de ces captures:
- `C:\Users\ilyas\OneDrive\Bureau\rapport\screen-preprod\Screenshots\2026-05\06\Screenshots\2026-06\chrome_v1JCMhHKIL.png`
- `C:\Users\ilyas\OneDrive\Bureau\rapport\screen-preprod\Screenshots\2026-05\06\Screenshots\2026-06\chrome_DuVq3amHt0.png`
- `C:\Users\ilyas\OneDrive\Bureau\rapport\screen-preprod\Screenshots\2026-05\06\Screenshots\2026-06\chrome_OdPlcrtJ6P.png`
- `C:\Users\ilyas\OneDrive\Bureau\rapport\screen-preprod\Screenshots\2026-05\06\Screenshots\2026-06\chrome_IfPle8o98l.png`

Symptomes observes:
- En dark mode, le menu natif `<select>` dans "Ajouter un repas" s'ouvrait avec fond blanc et texte incoherent/faible contraste.
- En light mode, les modals legacy restaient trop translucides (`bg-white/5`) sur overlay sombre, rendant le texte du modal et le contenu derriere ambigus.
- Le dashboard forcait `bg-[#070B14] text-white` meme quand le theme etait clair, puis `index.css` essayait de corriger via un pont CSS global `!important`.
- Le theme pouvait etre applique tardivement car `themeStore` initialisait `isDark` sans appeler `applyTheme()`.

Fichiers modifies:
- `frontend/src/store/themeStore.ts`
  - `isDark` initialise avec `applyTheme('system')` pour poser tout de suite `.dark`, `data-theme` et `theme-color`.
- `frontend/src/pages/DashboardPage.tsx`
  - Layout racine remplace `bg-[#070B14] text-white` par `bg-[var(--app-bg)] text-primary`.
  - Mobile bottom nav remplace le fond sombre force par `app-header` + `border-subtle`.
- `frontend/src/index.css`
  - Ajout styles globaux `select` / `select option` avec `color-scheme`, `background-color` et `color` bases sur tokens CSS.
  - En light mode, overlays `bg-black/50`, `bg-black/55`, `bg-black/60` reduits a `rgba(15, 23, 42, 0.34)`.
  - Les modals legacy `fixed inset-0 > relative bg-white/5` utilisent maintenant `var(--surface-elevated)`, `var(--border-subtle)` et `var(--text-primary)`.

Important:
- Changement limite au frontend web.
- `mobile-android/` non touche.
- Beaucoup de classes legacy `text-white`, `bg-white/5`, `text-gray-300` restent dans les panels. Le pont CSS global continue de les adapter en light mode; une migration complete vers tokens semantiques reste possible mais n'a pas ete faite pour garder le patch minimal.

## Analyse frontend recente - points ambigus

1. Auth et persistance:
   - Etat actuel observe: refresh token en cookie HttpOnly, mais access token encore persiste dans `localStorage` via Zustand persist.
   - C'est moins grave que refresh token en localStorage, mais reste ambigu avec l'objectif initial "memory-only".
   - A clarifier: access token doit-il rester persiste ou devenir memory-only avec bootstrap par `/auth/refresh` au chargement?

2. OAuth callback:
   - `OAuthCallbackPage.tsx` et `OAuth2OtpPage.tsx` utilisent maintenant `navigate('/', { replace: true })` au lieu de reload, ce qui evite d'effacer l'etat memoire.
   - Ancienne ambiguite detectee: `window.location.replace(...)` cassait l'auth memory-only.

3. Refresh race:
   - `frontend/src/api/axios.ts` contient maintenant un `refreshPromise` global pour eviter plusieurs refresh concurrents avec token rotation.

4. Keycloak register:
   - Backend expose `/api/auth/keycloak-register`.
   - Frontend `RegisterPage.tsx` pointe encore vers `${BACKEND_URL}/oauth2/authorization/keycloak`, comme `LoginPage.tsx`.
   - Ambiguite UX: bouton "S'inscrire avec Keycloak" n'utilise pas l'endpoint registration dedie.

5. VITE_API_URL:
   - En prod GitHub Pages, `VITE_API_URL` est critique.
   - Si absent, frontend tombe sur `/api` relatif a GitHub Pages, donc faux.
   - Workflow `.github/workflows/deploy-frontend.yml` injecte `VITE_API_URL: ${{ vars.VITE_API_URL }}`.

6. Mojibake / encodage:
   - Plusieurs fichiers frontend affichent des textes corrompus (`Ã©`, `â†`, etc.), surtout login/register/admin/public share.
   - Le build passe, mais c'est une ambiguite UX claire.

## Prochaines actions recommandees

1. Clarifier la strategie auth finale:
   - Option A: access token memory-only + refresh cookie HttpOnly + bootstrap `/auth/refresh` au chargement.
   - Option B: access token persiste en localStorage, refresh token uniquement cookie HttpOnly.
2. Corriger RegisterPage pour utiliser `/api/auth/keycloak-register` si on veut un vrai flux inscription Keycloak.
3. Corriger les textes mojibake dans le frontend.
4. Si le theme doit etre durci plus loin, migrer progressivement les panels legacy de `text-white` / `bg-white/5` / `text-gray-300` vers les tokens semantiques (`text-primary`, `text-secondary`, `surface-muted`, `glass-card`).
5. Relancer:
   - `mvn -q -DskipTests compile`
   - `npm.cmd run build`
6. Avant commit, verifier `git status --short` car beaucoup de fichiers non suivis/historiques existent.
