 Déduction — Approche finale Sommeil V2

  Les deux approches convergent sur l'essentiel. Codex apporte la rigueur technique, Claude l'UX. Voici la synthèse.

  ---
  Points critiques de Codex à intégrer absolument

  1. Cause racine des doublons (notre bug DayScore 500)
  Chaque save crée une nouvelle ligne. Le vrai fix n'est pas findFirst (patch) — c'est un upsert + contrainte unique :
  UNIQUE (user_id, sleep_date, type)
  Et PUT /api/sleep/nights/{date} au lieu de POST.

  2. Deux formules de score différentes — frontend recalcule côté client, backend recalcule dans DayScoreService. Il
  faut un seul score backend consommé partout (web, Android, DayScore).

  3. AiEntitlementService déjà existant → ajouter une catégorie SLEEP_COACH au lieu de dupliquer toute la logique
  d'accès.

  ---
  Architecture finale

  Base de données (3 domaines)

  sleep_logs             → nuit réellement passée (type: PRIMARY_NIGHT | NAP)
  sleep_plans            → objectif nuit future (coucher cible, réveil cible)
  sleep_environment_plan → routine personnelle réutilisable (1 par user)

  Migration V38 :
  - Contrainte unique (user_id, sleep_date, type) sur sleep_logs
  - Nettoyage des doublons existants (garder le plus récent)
  - Tables sleep_plans + sleep_environment_plan

  API

  GET  /api/sleep/dashboard?date=2026-06-01   → tout en un appel
  PUT  /api/sleep/nights/{date}               → upsert nuit principale
  GET  /api/sleep/trends?range=30d            → analytics
  PUT  /api/sleep/plans/{date}                → planifier une nuit future
  PUT  /api/sleep/environment-plan            → programme soir
  POST /api/sleep/ai-analysis                 → Coach IA (via AiEntitlementService SLEEP_COACH)

  ---
  Interface — Structure finale

  Navigation principale : switcher de date en haut (Codex)
  ←  Dim 31 mai  |  ● Lun 1 juin  |  Mar 2 juin →

  4 onglets :
  - Nuit — log quotidien + score + Coach IA
  - Historique — calendrier + heatmap + tendances
  - Planifier — objectifs nuits futures + cycles optimizer
  - Environnement — routine soir configurable

  ---
  Onglet Nuit — UX (Claude)

  Saisie en 3 étapes fluides :

  ① Timeline visuelle — frise 20h→12h, deux curseurs glissants
  - Fenêtre de sommeil colorée en violet en temps réel
  - Affiche : "8h — 5 cycles complets" + heures réveil optimales en vert

  ② Sensation au réveil — 1 clic
  😵 Épuisé  😪 Fatigué  😐 Correct  😊 Reposé  ⚡ En forme

  ③ Perturbations — collapsible, optionnel
  - Tags existants conservés + slider réveils

  Score live calculé côté backend via /api/sleep/score/preview (appel léger pendant saisie).

  Coach IA — bouton en bas de l'onglet Nuit :
  🤖 Analyser en profondeur  ●●●○○  3/5 essais gratuits
  3 types : Analyse nuit / Analyse 7 nuits / Programme 7 jours

  ---
  Ordre d'implémentation

  ┌───────┬─────────────────────────────────────────────────────────────────┬────────────────────┐
  │ Étape │                             Contenu                             │       Impact       │
  ├───────┼─────────────────────────────────────────────────────────────────┼────────────────────┤
  │ 1     │ Migration V38 — upsert + unique constraint + nettoyage doublons │ Fix root cause bug │
  ├───────┼─────────────────────────────────────────────────────────────────┼────────────────────┤
  │ 2     │ Centraliser score backend + invalider cache DayScore            │ Cohérence formule  │
  ├───────┼─────────────────────────────────────────────────────────────────┼────────────────────┤
  │ 3     │ Refonte UI — timeline slider + émojis + date navigator          │ UX quotidienne     │
  ├───────┼─────────────────────────────────────────────────────────────────┼────────────────────┤
  │ 4     │ Onglets Planifier + Environnement                               │ Proactivité        │
  ├───────┼─────────────────────────────────────────────────────────────────┼────────────────────┤
  │ 5     │ Coach IA — catégorie SLEEP_COACH dans AiEntitlementService      │ Feature premium    │
  └───────┴─────────────────────────────────────────────────────────────────┴────────────────────┘

  ---