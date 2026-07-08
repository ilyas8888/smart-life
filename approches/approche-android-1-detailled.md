# Étapes Initiales Manuelles — Android SmartLife

Ces étapes sont à faire manuellement AVANT de confier quoi que ce soit à Codex ou Claude.
Les faire soi-même économise des tokens et évite les allers-retours inutiles.

---

## ÉTAPE 1 — Installer Android Studio

1. Télécharger Android Studio stable : https://developer.android.com/studio
2. Lancer l'installeur et suivre les étapes par défaut
3. Au premier lancement, laisser Android Studio télécharger le SDK Android recommandé
4. Vérifier que le SDK est bien installé : **Settings → SDK Manager → Android 14 (API 34) coché**

---

## ÉTAPE 2 — Créer l'émulateur

1. Ouvrir **Device Manager** (icône téléphone en haut à droite)
2. Cliquer **Create Virtual Device**
3. Choisir **Pixel 8 Pro** (ou Pixel 8)
4. Choisir **Android 14 (API 34) — Google APIs** (obligatoire pour les services Google)
5. Finir la création avec les paramètres par défaut
6. Démarrer l'émulateur et vérifier qu'il boot correctement

---

## ÉTAPE 3 — Créer le projet Android

1. Dans Android Studio : **File → New → New Project**
2. Choisir **Empty Activity**
3. Remplir les champs :
   - **Name** : SmartLife
   - **Package name** : `com.smartlife.mobile`
   - **Save location** : `C:\Claude\gj\mobile-android`
   - **Language** : Kotlin
   - **Minimum SDK** : API 26 (Android 8.0)
   - **Build configuration language** : Kotlin DSL
4. Cliquer **Finish** et attendre la synchronisation Gradle
5. Lancer l'app sur l'émulateur (**Run → Run 'app'**) — l'écran "Hello Android!" doit s'afficher

---

## ÉTAPE 4 — Ajouter le dossier dans le repo Git

Ouvrir PowerShell dans `C:\Claude\gj` :

```powershell
git switch -c feat/android-mobile
git add mobile-android/
git commit -m "feat(android): init empty Android project"
```

---

## ÉTAPE 5 — Créer les 3 fichiers de référence (docs)

Créer le dossier `C:\Claude\gj\mobile-android\docs\` et créer ces 3 fichiers vides :

```
mobile-android/
└── docs/
    ├── API_CONTRACT.md      ← endpoints utilisés par le mobile
    ├── MOBILE_ROADMAP.md    ← phases + statut
    └── DESIGN_RULES.md      ← couleurs, typo, comportements
```

Ces fichiers seront remplis avec Codex/Claude mais doivent exister avant.

---

## ÉTAPE 6 — Créer le projet Firebase (pour les notifications)

À faire maintenant pour ne pas bloquer plus tard :

1. Aller sur https://console.firebase.google.com
2. **Add project** → nom : `smartlife-mobile`
3. Désactiver Google Analytics (optionnel)
4. Dans le projet Firebase : **Add app → Android**
5. Remplir :
   - **Android package name** : `com.smartlife.mobile`
   - **App nickname** : SmartLife Android
   - **SHA-1** : laisser vide pour l'instant
6. Télécharger `google-services.json`
7. Placer ce fichier dans `C:\Claude\gj\mobile-android\app\google-services.json`
8. **Ne jamais committer ce fichier** — ajouter à `.gitignore` :
   ```
   mobile-android/app/google-services.json
   ```

---

## ÉTAPE 7 — Vérifier la structure finale attendue

Avant de passer à Codex, vérifier que ces dossiers et fichiers existent :

```
C:\Claude\gj\
├── mobile-android/
│   ├── app/
│   │   ├── src/main/java/com/smartlife/mobile/
│   │   │   └── MainActivity.kt          ← créé par Android Studio
│   │   ├── google-services.json         ← Firebase (gitignored)
│   │   └── build.gradle.kts
│   ├── docs/
│   │   ├── API_CONTRACT.md
│   │   ├── MOBILE_ROADMAP.md
│   │   └── DESIGN_RULES.md
│   ├── gradle/
│   ├── build.gradle.kts
│   └── settings.gradle.kts
```

---

## ÉTAPE 8 — Ce qu'on donne à Codex ensuite

Une fois les étapes 1-7 terminées, Codex peut prendre le relais avec cette instruction précise :

```
Lis mobile-android/docs/API_CONTRACT.md.
Ajoute les dépendances Gradle (Hilt, Retrofit, Room, DataStore, Navigation Compose, Coil).
Implémente la fondation réseau : ApiClient, AuthInterceptor, TokenRefreshInterceptor, TokenDataStore.
Ne crée aucun écran sauf un écran de diagnostic qui affiche le token JWT stocké.
Lance gradlew.bat assembleDebug et corrige les erreurs.
```

---

## Récapitulatif des étapes manuelles

| # | Étape | Durée estimée |
|---|---|---|
| 1 | Installer Android Studio + SDK | 20-30 min |
| 2 | Créer l'émulateur | 5 min |
| 3 | Créer le projet Android | 5 min |
| 4 | Git init + branche | 2 min |
| 5 | Créer les 3 fichiers docs/ | 2 min |
| 6 | Créer projet Firebase + google-services.json | 10 min |
| 7 | Vérifier structure | 2 min |
| **Total** | | **~45 min** |
