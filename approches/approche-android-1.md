&#x20;# Approche Android Native Pour SmartLife



&#x20; La solution la plus cohérente est de créer une application Android native séparée dans le même dépôt:



&#x20; smart-life/

&#x20; ├── backend/

&#x20; ├── frontend/

&#x20; ├── ai-service/

&#x20; └── mobile-android/



&#x20; Le backend Spring Boot reste la source de vérité. L’application Android consomme les endpoints /api/\*\* existants. Il

&#x20; ne faut pas recopier la logique métier dans l’application mobile et il ne faut pas utiliser une simple WebView: cela

&#x20; donnerait une application moins fluide, moins professionnelle et difficile à faire évoluer.



&#x20; Android recommande actuellement Kotlin et Jetpack Compose pour les nouveaux projets. Le template conseillé est Empty

&#x20; Activity.

&#x20; Source officielle: Create a project (https://developer.android.com/studio/projects/create-project)



&#x20; ———



&#x20; # Stack Recommandée



&#x20;  Besoin                      Choix

&#x20; ━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

&#x20;  Langage                     Kotlin

&#x20; ──────────────────────────  ────────────────────────────────────────

&#x20;  UI native                   Jetpack Compose + Material 3

&#x20; ──────────────────────────  ────────────────────────────────────────

&#x20;  Architecture                MVVM + Repository + Use Cases ciblés

&#x20; ──────────────────────────  ────────────────────────────────────────

&#x20;  Navigation                  Navigation Compose

&#x20; ──────────────────────────  ────────────────────────────────────────

&#x20;  API REST                    Retrofit + OkHttp

&#x20; ──────────────────────────  ────────────────────────────────────────

&#x20;  Sérialisation JSON          Kotlin Serialization

&#x20; ──────────────────────────  ────────────────────────────────────────

&#x20;  Injection de dépendances    Hilt

&#x20; ──────────────────────────  ────────────────────────────────────────

&#x20;  Cache local                 Room

&#x20; ──────────────────────────  ────────────────────────────────────────

&#x20;  Préférences simples         DataStore

&#x20; ──────────────────────────  ────────────────────────────────────────

&#x20;  Authentification            JWT existant + refresh token

&#x20; ──────────────────────────  ────────────────────────────────────────

&#x20;  Stockage sensible           Android Keystore

&#x20; ──────────────────────────  ────────────────────────────────────────

&#x20;  Synchronisation             WorkManager

&#x20; ──────────────────────────  ────────────────────────────────────────

&#x20;  Images                      Coil

&#x20; ──────────────────────────  ────────────────────────────────────────

&#x20;  Notifications               Firebase Cloud Messaging

&#x20; ──────────────────────────  ────────────────────────────────────────

&#x20;  Tests                       JUnit, MockWebServer, Compose UI Tests



&#x20; Les recommandations officielles Android demandent une couche data, des repositories, des ViewModel, des Flow et un

&#x20; flux unidirectionnel entre état UI et actions utilisateur: Architecture recommendations

&#x20; (https://developer.android.com/topic/architecture/recommendations).



&#x20; ———



&#x20; # Expérience Mobile



&#x20; Ne cherchez pas à reproduire exactement le dashboard web. Sur mobile, l’interface doit être plus directe.



&#x20; ## Navigation Principale



&#x20; Utilisez une barre inférieure avec 5 entrées:



&#x20; 1. Aujourd’hui

&#x20; 2. Agenda

&#x20; 3. Ajouter

&#x20; 4. Social

&#x20; 5. Profil



&#x20; Le bouton central Ajouter ouvre une BottomSheet:



&#x20; - tâche;

&#x20; - rappel;

&#x20; - repas;

&#x20; - entraînement;

&#x20; - note;

&#x20; - sommeil;

&#x20; - session d’étude;

&#x20; - prompt IA.



&#x20; Les modules secondaires restent accessibles depuis l’écran Aujourd’hui sous forme de cartes.



&#x20; Pour les tablettes et appareils pliables, utilisez ensuite NavigationSuiteScaffold: barre inférieure sur téléphone et

&#x20; rail latéral sur grand écran. Android fournit précisément ce comportement: Adaptive navigation

&#x20; (https://developer.android.com/develop/ui/compose/layouts/adaptive/build-adaptive-navigation).



&#x20; ## Écran Aujourd’hui



&#x20; L’écran d’accueil doit immédiatement répondre à trois questions:



&#x20; - Que dois-je faire maintenant?

&#x20; - Où en suis-je aujourd’hui?

&#x20; - Quelle action puis-je enregistrer rapidement?



&#x20; Structure recommandée:



&#x20; Bonjour Ilyas

&#x20; Dimanche 31 mai



&#x20; \[ Score SmartDay : 78 / 100 ]



&#x20; \[ Prochaine action ]

&#x20; Réviser Docker Architecture · 18:00



&#x20; \[ Progression ]

&#x20; Tâches  4/7    Calories  1450/2200

&#x20; Sommeil 7h20   Étude     1h45

&#x20; Sport   1 séance



&#x20; \[ Actions rapides ]

&#x20; Repas  Tâche  Sport  Note



&#x20; \[ Timeline du jour ]



&#x20; ## Identité Visuelle



&#x20; Conservez l’identité SmartLife existante, mais appliquez une logique mobile:



&#x20; - Material 3;

&#x20; - dark mode complet;

&#x20; - cartes lisibles;

&#x20; - animations discrètes;

&#x20; - retour haptique sur validation;

&#x20; - états vides illustrés;

&#x20; - gestes simples: swipe pour terminer une tâche, appui long pour éditer;

&#x20; - boutons suffisamment grands pour être utilisés d’une seule main.



&#x20; ———



&#x20; # Architecture Technique



&#x20; mobile-android/app/src/main/java/com/smartlife/mobile/

&#x20; ├── core/

&#x20; │   ├── network/

&#x20; │   ├── database/

&#x20; │   ├── datastore/

&#x20; │   ├── designsystem/

&#x20; │   └── navigation/

&#x20; ├── feature/

&#x20; │   ├── auth/

&#x20; │   ├── home/

&#x20; │   ├── agenda/

&#x20; │   ├── tasks/

&#x20; │   ├── food/

&#x20; │   ├── workout/

&#x20; │   ├── sleep/

&#x20; │   ├── study/

&#x20; │   ├── social/

&#x20; │   ├── profile/

&#x20; │   └── ai/

&#x20; └── MainActivity.kt



&#x20; Commencez avec un seul module Gradle app. Organisez le code par fonctionnalités, mais ne créez pas immédiatement

&#x20; quinze modules Gradle: cela ajouterait de la complexité sans bénéfice concret au début.



&#x20; ———



&#x20; # Stratégie Offline



&#x20; Une bonne application mobile doit rester utile avec une connexion faible.



&#x20; Utilisez Room comme cache local pour:



&#x20; - tâches;

&#x20; - rappels;

&#x20; - timeline;

&#x20; - notes;

&#x20; - repas;

&#x20; - sommeil;

&#x20; - études;

&#x20; - entraînements récents.



&#x20; Utilisez DataStore uniquement pour:



&#x20; - thème;

&#x20; - état d’onboarding;

&#x20; - préférences utilisateur;

&#x20; - date de dernière synchronisation.



&#x20; La documentation Android recommande Room pour les données structurées complexes et DataStore pour les petites

&#x20; préférences: DataStore (https://developer.android.com/topic/libraries/architecture/datastore).



&#x20; ## Déploiement Progressif



&#x20; Ne rendez pas immédiatement toutes les écritures disponibles hors ligne.



&#x20; ### Première version



&#x20; - lecture depuis le cache local;

&#x20; - rafraîchissement API au lancement;

&#x20; - écriture en ligne uniquement;

&#x20; - message clair lorsque la connexion manque.



&#x20; ### Deuxième version



&#x20; - tâches, notes et repas enregistrables hors ligne;

&#x20; - file d’attente locale;

&#x20; - synchronisation avec WorkManager;

&#x20; - stratégie de conflits explicite.



&#x20; Android recommande WorkManager pour les tâches persistantes qui doivent survivre au redémarrage de l’application:

&#x20; WorkManager (https://developer.android.com/topic/libraries/architecture/workmanager/) et Offline-first

&#x20; (https://developer.android.com/topic/architecture/data-layer/offline-first).



&#x20; ———



&#x20; # Notifications



&#x20; Votre backend gère actuellement les notifications web push. Pour Android, ajoutez Firebase Cloud Messaging.



&#x20; Flux recommandé:



&#x20; Android reçoit le token FCM

&#x20;         ↓

&#x20; POST /api/mobile/push-token

&#x20;         ↓

&#x20; Backend sauvegarde le token par utilisateur

&#x20;         ↓

&#x20; Backend envoie les rappels via FCM

&#x20;         ↓

&#x20; Notification Android ouvre l’écran concerné



&#x20; Ajoutez des deep links:



&#x20; smartlife://tasks/42

&#x20; smartlife://reminders/18

&#x20; smartlife://social/posts/75



&#x20; FCM est prévu pour envoyer des notifications ou des messages de données aux clients Android: Firebase Cloud Messaging

&#x20; (https://firebase.google.com/docs/cloud-messaging).



&#x20; ———



&#x20; # Authentification



&#x20; Réutilisez votre backend existant:



&#x20; POST /api/auth/login

&#x20; POST /api/auth/register

&#x20; POST /api/auth/verify-otp

&#x20; POST /api/auth/refresh

&#x20; POST /api/auth/logout



&#x20; Stockez:



&#x20; - access token court en mémoire;

&#x20; - refresh token protégé avec Android Keystore;

&#x20; - interception automatique des réponses 401;

&#x20; - refresh token puis répétition de la requête;

&#x20; - logout local si le refresh échoue.



&#x20; Pour Keycloak OAuth2, ouvrez le navigateur système avec Custom Tabs puis revenez dans l’application avec un deep link.

&#x20; N’intégrez jamais le formulaire Keycloak dans une WebView.



&#x20; ———



&#x20; # Découpage Du Projet



&#x20; ## Phase 0: Contrat API



&#x20; Avant de coder les écrans, documentez les endpoints backend réellement nécessaires dans:



&#x20; mobile-android/docs/API\_CONTRACT.md



&#x20; Pour chaque endpoint:



&#x20; GET /api/tasks

&#x20; Auth: Bearer JWT

&#x20; Response: Task\[]

&#x20; Used by: TasksScreen, HomeScreen

&#x20; Offline cache: yes



&#x20; C’est l’étape la plus importante pour éviter les corrections répétitives.



&#x20; ## Phase 1: Fondation



&#x20; Objectif: application installable et connexion fonctionnelle.



&#x20; - créer le projet Android;

&#x20; - ajouter thème SmartLife;

&#x20; - configurer Retrofit, OkHttp et Hilt;

&#x20; - implémenter login, inscription, OTP, refresh et logout;

&#x20; - créer navigation principale;

&#x20; - afficher un écran Aujourd’hui minimal.



&#x20; ## Phase 2: MVP Utilisable



&#x20; Objectif: application déjà utile quotidiennement.



&#x20; - tâches;

&#x20; - rappels;

&#x20; - notes;

&#x20; - agenda;

&#x20; - timeline;

&#x20; - score SmartDay;

&#x20; - alimentation avec résumé journalier;

&#x20; - cache Room en lecture.



&#x20; ## Phase 3: Santé Et Productivité



&#x20; - sport;

&#x20; - sommeil;

&#x20; - études;

&#x20; - profils;

&#x20; - partage public;

&#x20; - deep links.



&#x20; ## Phase 4: Social Et IA



&#x20; - feed social;

&#x20; - réactions;

&#x20; - commentaires;

&#x20; - sauvegardes;

&#x20; - prompt IA;

&#x20; - quotas IA;

&#x20; - panneau admin mobile uniquement si réellement nécessaire.



&#x20; ## Phase 5: Finition



&#x20; - notifications FCM;

&#x20; - offline writes;

&#x20; - accessibilité;

&#x20; - tests UI;

&#x20; - icône;

&#x20; - splash screen;

&#x20; - signature release;

&#x20; - publication Play Store.



&#x20; ———



&#x20; # Étapes À Faire Manuellement



&#x20; Ces tâches consomment inutilement des tokens lorsqu’elles sont déléguées à Codex ou Claude Code.



&#x20; ## Avant Le Développement



&#x20; 1. Installer Android Studio stable.

&#x20; 2. Installer le SDK Android proposé par Android Studio.

&#x20; 3. Créer un émulateur Pixel récent avec Google APIs.

&#x20; 4. Créer manuellement mobile-android avec:

&#x20;     - Empty Activity;

&#x20;     - Kotlin;

&#x20;     - Jetpack Compose;

&#x20;     - package com.smartlife.mobile;

&#x20;     - minimum SDK 26 comme choix pragmatique.



&#x20; 5. Lancer l’application vide sur l’émulateur.

&#x20; 6. Créer une branche Git dédiée:



&#x20;    git switch -c feat/android-mobile



&#x20; ## Design



&#x20; Faites vous-même sur papier ou Figma:



&#x20; - navigation principale;

&#x20; - ordre des cartes de l’accueil;

&#x20; - palette claire et sombre;

&#x20; - logo;

&#x20; - icône;

&#x20; - écran de connexion;

&#x20; - écran d’ajout rapide;

&#x20; - comportement du bouton retour.



&#x20; Ne demandez pas à un agent de générer dix variantes avant d’avoir choisi la structure fonctionnelle.



&#x20; ## Firebase Et Publication



&#x20; Faites manuellement:



&#x20; - création du projet Firebase;

&#x20; - ajout de l’application Android;

&#x20; - téléchargement de google-services.json;

&#x20; - configuration Play Console;

&#x20; - création de la clé de signature release;

&#x20; - conservation sécurisée du keystore et de ses mots de passe;

&#x20; - saisie des descriptions, captures d’écran et politique de confidentialité.



&#x20; Ne partagez jamais les clés, tokens ou fichiers de signature dans un prompt.



&#x20; ## Vérification Visuelle



&#x20; Testez manuellement chaque écran sur:



&#x20; - petit téléphone;

&#x20; - téléphone standard;

&#x20; - grand téléphone;

&#x20; - mode sombre;

&#x20; - rotation écran;

&#x20; - réseau lent;

&#x20; - mode avion;

&#x20; - reprise après fermeture;

&#x20; - expiration du JWT.



&#x20; ———



&#x20; # Tâches À Confier À Codex



&#x20; Codex est utile pour les tâches déterministes:



&#x20; 1. Générer l’arborescence Android.

&#x20; 2. Ajouter les dépendances Gradle.

&#x20; 3. Implémenter Retrofit, OkHttp et l’intercepteur JWT.

&#x20; 4. Créer les modèles Kotlin depuis les DTO backend.

&#x20; 5. Ajouter Room, DAO et repositories.

&#x20; 6. Implémenter les écrans Compose un par un.

&#x20; 7. Écrire les tests.

&#x20; 8. Vérifier les builds avec:



&#x20;    gradlew.bat assembleDebug

&#x20;    gradlew.bat test

&#x20;    gradlew.bat lint



&#x20; 9. Comparer chaque endpoint mobile avec le contrôleur Spring Boot correspondant.

&#x20; 10. Ajouter les endpoints backend FCM lorsque l’application mobile est prête.



&#x20; ———



&#x20; # Méthode Pour Économiser Les Tokens



&#x20; Travaillez par lots courts et vérifiables.



&#x20; Au lieu de demander:



&#x20; > Crée toute l’application mobile SmartLife.



&#x20; Demandez:



&#x20; > Lis mobile-android/docs/API\_CONTRACT.md. Implémente uniquement la fondation réseau Android: Retrofit, OkHttp,

&#x20; > sérialisation JSON, stockage sécurisé du refresh token et intercepteur JWT. Ne crée aucun écran sauf un écran de

&#x20; > diagnostic. Lance le build et corrige les erreurs.



&#x20; Puis:



&#x20; > Implémente uniquement TasksScreen, son ViewModel, son repository, son cache Room et les tests. Réutilise les

&#x20; > conventions existantes.



&#x20; Maintenez trois petits fichiers de référence:



&#x20; mobile-android/docs/API\_CONTRACT.md

&#x20; mobile-android/docs/MOBILE\_ROADMAP.md

&#x20; mobile-android/docs/DESIGN\_RULES.md



&#x20; Cela évite de redonner tout le contexte à chaque intervention.



&#x20; ———



&#x20; # Priorité Recommandée



&#x20; La première livraison ne doit pas chercher la parité totale avec le site web. Faites une application Android

&#x20; réellement agréable avec:



&#x20; - authentification;

&#x20; - écran Aujourd’hui;

&#x20; - tâches;

&#x20; - rappels;

&#x20; - notes;

&#x20; - repas;

&#x20; - agenda;

&#x20; - cache local;

&#x20; - dark mode.



&#x20; Une fois ce socle stable, ajoutez sport, sommeil, études, social, IA et notifications. Cette séquence donne rapidement

&#x20; une application utilisable sans sacrifier la qualité finale.

