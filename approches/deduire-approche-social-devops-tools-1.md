---
  Déduction unifiée — DevOps pour SmartLife Social

  Ce que les deux approches apportent chacune

  ┌──────────────────────────────────┬──────────────────────────────────┐
  │              Codex               │           Claude Code            │
  ├──────────────────────────────────┼──────────────────────────────────┤
  │ Sécurité & tests (DevSecOps)     │ Performance & temps réel         │
  ├──────────────────────────────────┼──────────────────────────────────┤
  │ Testcontainers, Trivy, OWASP ZAP │ Redis, WebSocket/STOMP, RabbitMQ │
  ├──────────────────────────────────┼──────────────────────────────────┤
  │ OpenTelemetry + Loki (logs)      │ Prometheus + Grafana (métriques) │
  ├──────────────────────────────────┼──────────────────────────────────┤
  │ GitHub Environments staging/prod │ SonarCloud quality gate          │
  └──────────────────────────────────┴──────────────────────────────────┘

  Les deux disent la même chose sur Grafana — on les fusionne en une stack observabilité complète.

  ---
  Stack DevOps finale unifiée

  ┌──────────────────────────────────────────────────────────────┐
  │                  SmartLife Social — DevOps Stack             │
  ├──────────────────┬───────────────────────────────────────────┤
  │  Tests           │  Testcontainers (PostgreSQL réel)         │
  ├──────────────────┼───────────────────────────────────────────┤
  │  Sécurité CI     │  Trivy (Docker + dépendances)             │
  │                  │  OWASP ZAP (page publique shared_links)   │
  │                  │  SonarCloud (qualité + vulnérabilités)    │
  ├──────────────────┼───────────────────────────────────────────┤
  │  CI/CD           │  GitHub Actions enrichi                   │
  │                  │  GitHub Environments (staging → prod)     │
  ├──────────────────┼───────────────────────────────────────────┤
  │  Performance     │  Redis (cache feed + rate limiting)       │
  ├──────────────────┼───────────────────────────────────────────┤
  │  Temps réel      │  WebSocket + STOMP + Redis Pub/Sub        │
  ├──────────────────┼───────────────────────────────────────────┤
  │  Async           │  RabbitMQ (notifications décuplées)       │
  ├──────────────────┼───────────────────────────────────────────┤
  │  Observabilité   │  OpenTelemetry (traces)                   │
  │                  │  Prometheus (métriques)                   │
  │                  │  Grafana + Loki (dashboard + logs)        │
  └──────────────────┴───────────────────────────────────────────┘

  ---
  Ordre d'intégration par sprint social

  ┌────────────────────┬──────────────────────────────────────────┬────────────────────────────────────────────────┐
  │       Sprint       │             Outils à ajouter             │                     Raison                     │
  ├────────────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────┤
  │ S1 — Liens         │ Testcontainers + Trivy + GitHub          │ La page publique = surface d'attaque. Tests    │
  │ partageables       │ Environments + Redis (rate limit)        │ permissions critiques dès le début             │
  ├────────────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────┤
  │ S2 — Communauté /  │ Redis (cache feed) + Prometheus +        │ Feed = besoin de perf + métriques. Dashboard   │
  │ Feed               │ Grafana + Loki + SonarCloud              │ portfolio visible                              │
  ├────────────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────┤
  │ S3 — Notifications │ WebSocket + STOMP + Redis Pub/Sub +      │ Traces des actions sociales (clone, réaction,  │
  │  live              │ OpenTelemetry                            │ commentaire)                                   │
  ├────────────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────┤
  │ S4 — Scale &       │ RabbitMQ + OWASP ZAP                     │ Async robuste + audit sécurité page publique   │
  │ sécurité           │                                          │                                                │
  └────────────────────┴──────────────────────────────────────────┴────────────────────────────────────────────────┘

  ---
  Ligne CV / portfolio finale

  ▎ "Built a privacy-first social sharing platform (SmartLife) — secure public links with expiration/revocation,
  ▎ community feed, real-time notifications via WebSocket/STOMP + Redis Pub/Sub, async event processing with RabbitMQ,
  ▎ integration tests with Testcontainers, CI/CD pipeline including Trivy vulnerability scan, SonarCloud quality gate,
  ▎ OWASP ZAP security audit, and full observability stack: OpenTelemetry traces + Prometheus metrics + Grafana + Loki."

  ---