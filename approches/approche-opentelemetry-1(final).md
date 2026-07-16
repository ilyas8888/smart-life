 ---
  Plan OTel — Décomposition complète

  ---
  Phase 0 — Hygiène sécurité (5 min)

  - Révoquer le token Grafana Cloud exposé dans prometheus.yml
  - Remplacer par variable d'environnement GRAFANA_TOKEN
  - Vérifier .gitignore couvre bien monitoring/prometheus.yml et monitoring/alloy-config.alloy

  ---
  Phase 1 — Backend Spring Boot — Auto-instrumentation

  1.1 — Dépendances Maven (5 min)
  - Ajouter micrometer-tracing-bridge-otel dans pom.xml
  - Ajouter opentelemetry-exporter-otlp
  - Vérifier pas de conflit avec Micrometer/Actuator existant

  1.2 — Configuration OTLP (10 min)
  - Ajouter bloc management.otlp.tracing dans application.yml
  - Configurer endpoint, auth Basic, service name smartlife-backend
  - Sampling : 1.0 en local, 0.1 en prod (variable)

  1.3 — Secrets HF Space (5 min)
  - Ajouter OTLP_ENDPOINT (ex: https://otlp-gateway-prod-eu-west-2.grafana.net/otlp)
  - Ajouter OTLP_TOKEN (base64 instanceId:apiKey)
  - Référencer dans application-prod.yml

  1.4 — Validation (10 min)
  - Déployer backend
  - Appeler /api/score/today + /api/prompt
  - Vérifier dans Grafana Tempo : spans HTTP + JDBC + Redis visibles

  ---
  Phase 2 — FastAPI AI Service — Instrumentation

  2.1 — Dépendances Python (5 min)
  - Ajouter dans ai-service/requirements.txt :
  opentelemetry-distro, opentelemetry-exporter-otlp, opentelemetry-instrumentation-fastapi,
  opentelemetry-instrumentation-httpx, opentelemetry-instrumentation-logging

  2.2 — Dockerfile + démarrage (10 min)
  - Modifier CMD dans ai-service/Dockerfile : remplacer uvicorn par opentelemetry-instrument uvicorn
  - Exclure /health des traces : OTEL_PYTHON_FASTAPI_EXCLUDED_URLS=health

  2.3 — Variables d'environnement OTEL FastAPI (5 min)
  - OTEL_SERVICE_NAME=smartlife-ai-service
  - OTEL_EXPORTER_OTLP_ENDPOINT + OTEL_EXPORTER_OTLP_HEADERS
  - OTEL_TRACES_EXPORTER=otlp, OTEL_METRICS_EXPORTER=none, OTEL_LOGS_EXPORTER=none
  - Ajouter dans HF Space AI Service secrets

  2.4 — Spans manuels Anthropic (15 min)
  - Créer helper record_anthropic_call(operation) dans main.py
  - Wrapper les 4 appels Anthropic (prompt_process, food_decompose, food_extract, workout_extract)
  - Attributs : gen_ai.request.model, smartlife.ai.result, gen_ai.usage.input_tokens/output_tokens
  - Ne jamais attacher : prompt brut, réponse brute, X-Internal-Key

  2.5 — Validation trace end-to-end (5 min)
  - Exécuter un prompt IA
  - Vérifier dans Tempo la trace complète :
  POST /api/prompt (Spring)
    └── POST /process (FastAPI)
          └── anthropic.prompt_process

  ---
  Phase 3 — Corrélation Logs + Traces

  3.1 — Logback backend (10 min)
  - Créer backend/src/main/resources/logback-spring.xml
  - Pattern : %d [%X{traceId} %X{spanId}] %-5level %logger{36} - %msg%n
  - L'agent Micrometer injecte automatiquement via MDC

  3.2 — Logs Python FastAPI (5 min)
  - Ajouter OTEL_PYTHON_LOG_CORRELATION=true
  - Configurer format : trace_id=%(otelTraceID)s span_id=%(otelSpanID)s

  3.3 — Politique logs (non-code) (5 min)
  - Vérifier qu'aucun log existant n'imprime : email, IP, JWT, OTP, prompt IA, contenu notes
  - Supprimer ou masquer si trouvé

  3.4 — Loki (optionnel, Palier 2) (20 min si activé)
  - Ajouter datasource Loki dans Grafana Cloud
  - Push logs via docker-compose local (Alloy ou Promtail)
  - Lien Tempo → Loki par traceId dans Grafana

  ---
  Phase 4 — Spans Métier Custom

  4.1 — Configuration AOP @Observed (10 min)
  - Créer ObservationConfig.java : bean ObservedAspect
  - Ajouter dépendance spring-boot-starter-aop si absente

  4.2 — Spans P0 (critiques) (15 min)
  - DayScoreService.calculateScore → @Observed(name="smartlife.day_score.compute")
    - attributs : smartlife.score.band, smartlife.score.modules_count
  - AiService.processPrompt → @Observed(name="smartlife.ai.prompt.process")
    - attributs : smartlife.ai.access_status, smartlife.ai.cache_hit

  4.3 — Spans P1 (utiles) (15 min)
  - FoodSearchService → smartlife.food.suggestions.search
    - attributs : smartlife.food.source (cache/pg_trgm/usda/off)
  - NotificationService.send → smartlife.notification.send
    - attributs : smartlife.notification.type (REACTION/COMMENT/SAVE), smartlife.notification.online
  - PushNotificationService → smartlife.push.send
    - attributs : smartlife.push.result (success/offline/error)

  4.4 — Spans P2 (secondaires) (10 min)
  - AuthService.login → smartlife.auth.login
    - attributs : smartlife.auth.result (success/invalid_credentials/otp_required)
  - AuthService.verifyOtp → smartlife.auth.verify_otp
    - attributs : smartlife.auth.result (success/expired/invalid)

  4.5 — Validation attributs PII (5 min)
  - Vérifier dans Tempo qu'aucun span ne contient : userId, email, IP, contenu prompt, valeur JWT

  ---
  Phase 5 — Dashboard, Alertes, Rollback

  5.1 — Dashboard "SmartLife Observability" (15 min)
  - Créer dossier Grafana SmartLife Observability
  - Row 1 — Métriques (Prometheus existant) : JVM Memory, CPU, HikariCP, p95 latence
  - Row 2 — Traces (Tempo) : Service Map, RED par endpoint, top routes lentes
  - Row 3 — IA : appels Anthropic, latence p95, tokens input/output, cache hit ratio

  5.2 — Datasource Tempo + liens croisés (10 min)
  - Configurer Tempo datasource dans Grafana Cloud
  - Activer lien Prometheus exemplars → Tempo (trace drill-down depuis métrique)
  - Activer lien Tempo → Loki si Phase 3.4 faite

  5.3 — Alertes (15 min)

  ┌─────┬─────────────────────┬─────────────────────┬──────────┐
  │  #  │       Alerte        │      Condition      │ Sévérité │
  ├─────┼─────────────────────┼─────────────────────┼──────────┤
  │ A1  │ Backend unavailable │ Health absent 2 min │ Critique │
  ├─────┼─────────────────────┼─────────────────────┼──────────┤
  │ A2  │ 5xx rate            │ >5% sur 5 min       │ Haute    │
  ├─────┼─────────────────────┼─────────────────────┼──────────┤
  │ A3  │ Backend latency     │ p95 >2s sur 10 min  │ Moyenne  │
  ├─────┼─────────────────────┼─────────────────────┼──────────┤
  │ A4  │ IA latency          │ p95 >15s sur 10 min │ Haute    │
  ├─────┼─────────────────────┼─────────────────────┼──────────┤
  │ A5  │ IA invalid JSON     │ >3% sur 15 min      │ Moyenne  │
  ├─────┼─────────────────────┼─────────────────────┼──────────┤
  │ A6  │ OTP failures spike  │ Hausse anormale     │ Sécurité │
  └─────┴─────────────────────┴─────────────────────┴──────────┘

  5.4 — Rollback documenté (5 min)
  - Backend : ajouter var OTEL_ENABLED=false dans HF Space → restart (0 code)
  - FastAPI : retirer opentelemetry-instrument du CMD Dockerfile → redeploy
  - Principe : OTel jamais sur le chemin critique métier, désactivable sans casser l'app

  ---
  Récapitulatif final

  ┌──────────────────┬────────────────┬───────────┬─────────────┐
  │      Phase       │  Sous-phases   │   Durée   │  Prérequis  │
  ├──────────────────┼────────────────┼───────────┼─────────────┤
  │ 0 — Sécurité     │ —              │ 5 min     │ Aucun       │
  ├──────────────────┼────────────────┼───────────┼─────────────┤
  │ 1 — Backend      │ 1.1 → 1.4      │ 30 min    │ Phase 0     │
  ├──────────────────┼────────────────┼───────────┼─────────────┤
  │ 2 — FastAPI      │ 2.1 → 2.5      │ 40 min    │ Phase 1     │
  ├──────────────────┼────────────────┼───────────┼─────────────┤
  │ 3 — Logs         │ 3.1 → 3.4      │ 20-40 min │ Phase 1+2   │
  ├──────────────────┼────────────────┼───────────┼─────────────┤
  │ 4 — Spans métier │ 4.1 → 4.5      │ 55 min    │ Phase 1     │
  ├──────────────────┼────────────────┼───────────┼─────────────┤
  │ 5 — Dashboard    │ 5.1 → 5.4      │ 45 min    │ Phase 1+2+3 │
  ├──────────────────┼────────────────┼───────────┼─────────────┤
  │ Total            │ 20 sous-phases │ ~3h15     │             │
  └──────────────────┴────────────────┴───────────┴─────────────┘

  ---




[[ Phase 5.3 — Alertes Grafana

  D'abord on configure le canal email, puis les 3 alertes Prometheus.

  Étape 1 — Contact point email

  Menu gauche → Alerts & IRM → Alerting → Contact points → + Add contact point :
  - Name : SmartLife Email
  - Integration : Email
  - Addresses : ilyassboulouiz@gmail.com
  - Save

  ---
  Étape 2 — Alerte 1 : 5xx élevés

  Alerting → Alert rules → + New alert rule

  - Name : SmartLife — Erreurs 5xx élevées
  - Datasource : grafanacloud-ilyas8888-prom
  - PromQL :
  sum(rate(http_server_requests_seconds_count{application="smartlife", status=~"5.."}[5m]))
  /
  sum(rate(http_server_requests_seconds_count{application="smartlife"}[5m]))
  - Condition : IS ABOVE 0.05
  - Evaluate every : 1m — Pending : 5m
  - Folder : SmartLife (crée-le)
  - Notification : SmartLife Email
  - Summary : Taux d'erreurs 5xx > 5% depuis 5 minutes
  - Save