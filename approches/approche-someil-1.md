Approche Claude Code :
Approche Sommeil V2 — SmartLife

  Diagnostic de l'existant

  Le Sleep Coach actuel a une bonne base (formulaire modal, score, historique, smart insights) mais souffre de 3
  problèmes :
  - Le formulaire est trop formulaire — pas de fluidité, pas de magie
  - Zéro feedback temps réel — le score apparaît seulement après submit
  - Pas de programme proactif — l'app réagit, elle n'anticipe pas

  ---
  Structure proposée — 3 onglets

  ---
  Onglet 1 — Hier soir (Log quotidien)

  Objectif : 30 secondes max, visuellement gratifiant

  Étape 1 — Timeline visuelle (remplace les date/time pickers)
  - Une frise de 24h (20h → 12h), deux curseurs glissants pour coucher/réveil
  - La "fenêtre de sommeil" se colore en temps réel (violet foncé)
  - Durée + cycles de 90 min affichés : "3 cycles complets + 30 min"
  - Heures de réveil optimales suggérées en vert sous la frise

  Étape 2 — Sensation au réveil (5 secondes)
  5 états visuels avec emoji expressifs, pas de chiffres :
  😵 Épuisé  →  😪 Fatigué  →  😐 Correct  →  😊 Reposé  →  ⚡ En forme
  Sélection = 1 clic, correspondance interne 1→5

  Étape 3 — Perturbations (optionnel, collapsible)
  - Tags visuels déjà existants (caféine, stress, etc.) → conserver
  - Réveils : slider 0→4+ avec animation
  - Qualité subjective : slider fluide au lieu des boutons 1-5

  Score live — pendant la saisie, une jauge animée se remplit en temps réel. L'user voit son score évoluer avant même de
  valider.

  Nuits précédentes / futures — switcher discret en haut :
  ← Avant-hier  |  Hier soir ●  |  Planifier ce soir →

  ---
  Onglet 2 — Mon sommeil (Analytics)

  Garder l'existant + 3 ajouts :
  - Heatmap style GitHub contributions (52 semaines, couleur = score)
  - Corrélation facteurs — bulle chart : "les nuits avec caféine = -18 pts en moyenne"
  - Chronotype — détecté automatiquement depuis les données : "Tu es un couche-tard naturel. Ton pic de récupération est
  entre 00h-08h."

  ---
  Onglet 3 — Programme (Environnement + Planning)

  Evening Routine Builder
  - Rappels configurables : extinction écrans (ex: 22h), relaxation (22h30), coucher cible (23h)
  - Notifications push aux heures définies
  - Checklist soir : température chambre, rideaux, téléphone hors chambre, lumière tamisée

  Cycles Optimizer
  - Basé sur l'heure de réveil souhaitée → suggère les heures de coucher optimales (multiples de 90 min)
  - Ex : "Pour être au top à 7h → couche-toi à 23h30 ou 01h00"

  ---
  AI Sleep Coach — 5 utilisations gratuites

  Même mécanique que la section Prompt IA (même logique de quota).

  3 types d'analyses :

  ┌──────────────────────────┬───────────────────────────────┬───────────┐
  │          Action          │       Prompt Anthropic        │   Coût    │
  ├──────────────────────────┼───────────────────────────────┼───────────┤
  │ "Analyse ma nuit"        │ Dernière nuit + profil        │ 1 crédit  │
  ├──────────────────────────┼───────────────────────────────┼───────────┤
  │ "Analyse mes 7 nuits"    │ Historique semaine + facteurs │ 1 crédit  │
  ├──────────────────────────┼───────────────────────────────┼───────────┤
  │ "Programme personnalisé" │ 30 nuits + objectifs          │ 2 crédits │
  └──────────────────────────┴───────────────────────────────┴───────────┘

  UI du quota :
  🤖 Sleep Coach IA  ●●●○○  3/5 utilisations gratuites
  Après 5 → même écran que Prompt IA (accès restreint, upgrade).

  Qualité des insights IA — l'IA reçoit en contexte :
  - Les 30 dernières nuits (durée, qualité, énergie, facteurs)
  - Les corrélations détectées
  - L'objectif de l'user (si défini)

  Elle répond avec des conseils actionnables et personnalisés, pas génériques.

  ---
  Plan technique

  Backend

  Existant à garder : SleepLog, SleepLogController, SleepLogRepository

  Nouveau :
  - SleepAiService → appel Anthropic avec contexte sommeil (30 nuits + facteurs)
  - Migration V38 → colonne sleep_ai_uses INT DEFAULT 0 dans users
  - Endpoint POST /api/sleep/ai/analyze → vérifie quota, appelle IA, retourne conseils
  - Endpoint POST /api/sleep/plan → sauvegarder programme soir (heures cibles, checklist)

  Frontend

  Restructurer SleepPage.tsx :
  - 3 onglets avec React tabs
  - Nouveau composant SleepQuickLog — timeline slider (librairie rc-slider ou custom CSS)
  - Composant SleepAiCoach — affichage quota + bouton + résultat formaté
  - Composant EnvironmentProgram — checklist + rappels

  ---
  Mon avis

  La valeur réelle de cette section n'est pas dans le log — c'est dans les corrélations. L'user ne sait pas que la
  caféine après 15h lui coûte 20 points. L'app doit le lui montrer avec ses propres données.

  L'IA doit être réservée aux insights qui nécessitent vraiment du raisonnement (patterns sur 30 nuits, recommandations
  personnalisées) — pas pour reformuler ce que l'user vient d'entrer.

  Priorité d'implémentation suggérée :
  1. Refonte UI Quick Log (timeline slider + émojis) — impact visuel maximal
  2. Score live pendant la saisie
  3. AI Coach avec quota
  4. Programme environnement
  5. Analytics avancés (heatmap, corrélations)

Approche Codex :

Analyse Sommeil
  J’ai lu analyzes/promptcodex-someil-1.md et examiné les captures ainsi que l’existant. Aucune modification effectuée.

  État Actuel
  La base visuelle est déjà correcte : saisie rapide, score, moyenne 7 jours, historique et conseils locaux dans
  frontend/src/components/SleepPanel.tsx:135.

  Mais trois limites structurelles empêchent d’en faire un vrai coach quotidien :

  1. Chaque sauvegarde crée une nouvelle ligne dans backend/src/main/java/com/smartlife/controller/
     SleepLogController.java:42. C’est la source des doublons ayant provoqué le 500 DayScore.

  2. Le score affiché par le frontend et celui intégré au DayScore utilisent deux formules différentes : frontend/src/
     components/SleepPanel.tsx:135, backend/src/main/java/com/smartlife/service/DayScoreService.java:47.

  3. Une nuit réelle, une sieste et un plan pour une nuit future ne sont pas des objets métier équivalents. Ils ne
     doivent pas être stockés dans la même table.

  Expérience Recommandée
  La section doit devenir un cockpit quotidien centré sur une date sélectionnée :

  ←  Dimanche 31 mai    Aujourd’hui : lundi 1 juin    Mardi 2 juin  →

  Pour aujourd’hui, le bloc principal est Ma dernière nuit. Une saisie standard doit prendre moins de 30 secondes :

  1. Coucher et réveil, avec durée calculée immédiatement.
  2. Réveils nocturnes : 0, 1, 2-3, 4+.
  3. Ressenti au réveil : énergie, qualité perçue et humeur.
  4. Perturbations optionnelles : stress, écrans, caféine, bruit, température, repas lourd, douleur, alcool, enfant,
     réveil imprévu.

  5. Note libre facultative.

  Après sauvegarde, l’utilisateur obtient immédiatement un score déterministe, une explication lisible et une seule
  action prioritaire pour ce soir.

  Structure De Page

  - Aujourd’hui : dernière nuit, score détaillé et action recommandée.
  - Historique : calendrier, nuits précédentes modifiables et tendances 7/30 jours.
  - Planifier : coucher cible, réveil cible et routine pour les prochaines nuits.
  - Environnement : programme personnel de préparation de la chambre et du corps.
  - Coach IA : analyse approfondie explicite, jamais déclenchée automatiquement.

  Le score doit être décomposé visuellement : durée, régularité, continuité, récupération et perturbations. Un 78/100
  devient compréhensible : « bonne durée, mais deux réveils et écran tardif ».

  Programme D’Environnement
  Créer une routine configurable avec rappels relatifs au coucher cible :

  - 3 h : dernier repas lourd
  - 6 h : dernière caféine
  - 60 min : lumière réduite et écrans limités
  - 30 min : chambre préparée, température vérifiée
  - 10 min : respiration, lecture ou journal

  L’utilisateur active uniquement les étapes utiles. Le lendemain, SmartLife mesure les corrélations : « les nuits sans
  écran tardif ont obtenu +11 points en moyenne ».

  IA Anthropic
  Mon avis : Anthropic ne doit pas être appelé pour calculer le score ni pour afficher les conseils quotidiens simples.
  Ces fonctions doivent rester gratuites, instantanées et disponibles même si le service IA est indisponible.

  Ajouter un bouton Analyse IA approfondie :

  - synthèse des 7 ou 30 dernières nuits ;
  - identification des facteurs récurrents ;
  - proposition d’un programme personnalisé sur 7 jours ;
  - comparaison des résultats après une semaine ;
  - avertissement clair : conseils de bien-être, pas diagnostic médical.

  Le projet possède déjà les cinq essais gratuits dans backend/src/main/java/com/smartlife/service/
  AiEntitlementService.java:68. Techniquement, je recommande un portefeuille IA central avec une catégorie SLEEP_COACH,
  afin de tracer la consommation sans dupliquer toute la logique d’accès.

  Modèle Technique
  Créer trois domaines séparés :

  sleep_logs             nuit réellement passée
  sleep_plans            objectif pour une nuit future
  sleep_environment_plan routine personnelle réutilisable

  Pour sleep_logs, ajouter un type PRIMARY_NIGHT ou NAP. Une nuit principale doit avoir une contrainte unique (user_id,
  sleep_date, type). La création devient un upsert explicite : modifier la nuit existante ou demander confirmation. Une
  sieste reste additionnelle.

  Le calcul du score doit migrer vers un service backend unique, consommé par le frontend web, Android et le DayScore.
  Toute création, modification ou suppression doit invalider les caches DayScore concernés.

  API Cible

  GET  /api/sleep/dashboard?date=2026-06-01
  PUT  /api/sleep/nights/{date}
  GET  /api/sleep/trends?range=30d
  PUT  /api/sleep/plans/{date}
  PUT  /api/sleep/environment-plan
  POST /api/sleep/ai-analysis

  Ordre D’Implémentation

  1. Corriger le modèle métier : nuit principale unique, siestes séparées, upsert et nettoyage des doublons.
  2. Centraliser le score backend et invalider le cache DayScore.
  3. Recomposer l’interface web autour du navigateur de dates et de la dernière nuit.
  4. Ajouter planification et programme d’environnement.
  5. Ajouter le Coach IA limité à cinq essais, puis aligner Android sur la même API.

  Cette approche résout le problème utilisateur quotidien avant d’ajouter l’IA : enregistrer rapidement, comprendre ce
  qui dégrade réellement le sommeil et appliquer une action simple le soir suivant.
