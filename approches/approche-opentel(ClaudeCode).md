Approche Claude Code
 ---
  Approche OTel — SmartLife

  Vue d'ensemble

  Browser → Spring Boot → PostgreSQL (Neon)
                        → Redis (Upstash)
                        → AI Service (FastAPI)

  Traces OTLP → Grafana Cloud Tempo
  Métriques → Grafana Cloud Prometheus (déjà actif)
  Logs → Grafana Cloud Loki (nouveau)

  Résultat = Les 3 piliers de l'observabilité dans un seul dashboard

  ---
  Phase 1 — Auto-instrumentation Backend (30 min, 0 ligne de code métier)

  Ce qu'on ajoute :
  - 2 dépendances Maven (micrometer-tracing-bridge-otel + opentelemetry-exporter-otlp)
  - 8 lignes application.yml pour configurer l'exporter OTLP → Grafana Tempo
  - 2 secrets HF Space : OTLP_ENDPOINT + OTLP_TOKEN

  Ce que Spring Boot instrumente automatiquement :
  - Toutes les requêtes HTTP entrantes (controller → response)
  - Toutes les requêtes SQL JDBC vers Neon PostgreSQL
  - Toutes les commandes Redis (Lettuce) vers Upstash
  - Les appels RestTemplate/WebClient sortants (vers USDA API, AI Service)

  Visible dans Grafana dès la fin de cette phase :
  GET /api/score/today  245ms
    ├── JDBC SELECT sleep_records     89ms
    ├── JDBC SELECT food_logs          12ms
    ├── Redis GET score:today:42       2ms
    └── JDBC SELECT workout_sessions   8ms

  ---
  Phase 2 — Corrélation Logs + Traces (20 min)

  Ce qu'on ajoute :
  - logback-spring.xml : pattern avec [%X{traceId} %X{spanId}] dans chaque ligne de log
  - Loki datasource dans Grafana Cloud (push logs via Alloy ou docker-compose)

  Résultat :
  - Dans Grafana, tu cliques sur une trace → tu vois tous les logs produits pendant cette requête
  - En prod sur HF Space : si un 500 arrive, tu cherches le traceId → tu vois exactement la stack trace Spring qui a
  explosé, liée à la trace

  ---
  Phase 3 — Spans Métier Custom (45 min)

  C'est ici que l'observabilité devient vraiment utile pour tes features.

  Méthode : @Observed annotation (Spring AOP, 0 boilerplate dans le code métier)

  Services ciblés :

  ┌─────────────────────┬───────────────────┬──────────────────────────────────────────────┐
  │       Service       │       Span        │               Attributs custom               │
  ├─────────────────────┼───────────────────┼──────────────────────────────────────────────┤
  │ DayScoreService     │ score.calculate   │ userId, band (EXCELLENT/GOOD…), modulesCount │
  ├─────────────────────┼───────────────────┼──────────────────────────────────────────────┤
  │ FoodSearchService   │ food.search       │ userId, query, source (cache/pg_trgm/usda)   │
  ├─────────────────────┼───────────────────┼──────────────────────────────────────────────┤
  │ NotificationService │ notification.send │ type (REACTION/COMMENT/SAVE), online (bool)  │
  ├─────────────────────┼───────────────────┼──────────────────────────────────────────────┤
  │ AiService           │ ai.prompt         │ userId, creditsUsed, tokensIn/Out            │
  ├─────────────────────┼───────────────────┼──────────────────────────────────────────────┤
  │ PushScheduler       │ push.batch        │ sentCount, failedCount                       │
  └─────────────────────┴───────────────────┴──────────────────────────────────────────────┘

  Visible dans Grafana :
  GET /api/food-logs  178ms
    ├── food.search (source=cache)         3ms  ✅
    └── food.search (source=usda_api)    160ms  ← USDA lent
          └── HTTP GET api.usda.gov       158ms

  ---
  Phase 4 — Dashboards Grafana "Golden Trio" (30 min)

  Un seul dashboard avec 3 sections :

  Section Traces (Tempo)
  - Service Map automatique (Spring Boot → PostgreSQL → Redis → USDA)
  - Tableau RED par endpoint : Rate (req/s) / Errors (%) / Duration (p50/p95/p99)
  - Search par traceId (debug d'un incident spécifique)

  Section Métriques (Prometheus — déjà actif)
  - JVM Memory / CPU / HikariCP connections (déjà visible)
  - Compteurs smartlife.* métier déjà en place

  Section Logs (Loki)
  - Logs filtrés par traceId sélectionné
  - Erreurs 5xx avec contexte complet

  Navigation croisée :
  - Clic sur un pic de latence → trace correspondante
  - Clic sur une trace → logs de cette requête
  - "Explore" un log d'erreur → sa trace parente

  ---
  Phase 5 — Alertes Proactives (20 min)

  3 alertes Grafana Cloud à configurer :

  ┌─────────────────────┬───────────────────────────┬───────┐
  │       Alerte        │         Condition         │ Canal │
  ├─────────────────────┼───────────────────────────┼───────┤
  │ Latence élevée      │ p95 > 2s pendant 5min     │ Email │
  ├─────────────────────┼───────────────────────────┼───────┤
  │ Taux d'erreur       │ Errors > 5% pendant 3min  │ Email │
  ├─────────────────────┼───────────────────────────┼───────┤
  │ Score endpoint down │ Pas de trace depuis 10min │ Email │
  └─────────────────────┴───────────────────────────┴───────┘

  ---
  Récapitulatif

  ┌──────────────────────────┬────────┬────────────────────────────────┬────────────┐
  │          Phase           │ Effort │             Valeur             │ Difficulté │
  ├──────────────────────────┼────────┼────────────────────────────────┼────────────┤
  │ 1. Auto-instrumentation  │ 30 min │ Traces HTTP+SQL+Redis          │ Facile     │
  ├──────────────────────────┼────────┼────────────────────────────────┼────────────┤
  │ 2. Logs corrélés         │ 20 min │ Debug en 2 clics               │ Facile     │
  ├──────────────────────────┼────────┼────────────────────────────────┼────────────┤
  │ 3. Spans métier          │ 45 min │ Visibilité features            │ Moyen      │
  ├──────────────────────────┼────────┼────────────────────────────────┼────────────┤
  │ 4. Dashboard Golden Trio │ 30 min │ Vue prod complète              │ Moyen      │
  ├──────────────────────────┼────────┼────────────────────────────────┼────────────┤
  │ 5. Alertes               │ 20 min │ Proactivité                    │ Facile     │
  ├──────────────────────────┼────────┼────────────────────────────────┼────────────┤
  │ Total                    │ ~2h30  │ Observabilité production-grade │            │
  └──────────────────────────┴────────┴────────────────────────────────┴────────────┘

  ---