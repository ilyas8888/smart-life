# Approche OpenTelemetry pour SmartLife

## 1. Objectif

Introduire OpenTelemetry (OTel) comme standard transversal d'observabilite pour SmartLife sans casser l'existant.

Le but n'est pas de remplacer Prometheus, Grafana ou Sentry immediatement. OTel doit completer l'architecture avec:

- des traces distribuees entre le frontend web, le backend Spring Boot et le service IA FastAPI;
- une correlation exploitable entre traces, metriques et logs;
- des metriques metier ciblees;
- une collecte centralisee et vendor-neutral;
- une configuration locale simple et une production securisee.

## 2. Etat actuel utile

SmartLife possede deja:

- Spring Boot Actuator et Micrometer;
- un endpoint Prometheus `/actuator/prometheus`;
- des metriques metier dans `MetricsService`;
- Prometheus et Grafana dans `docker-compose.yml`;
- un brouillon Grafana Alloy pour envoyer les metriques vers Grafana Cloud;
- Sentry cote React et une dependance Sentry cote backend;
- un service IA FastAPI separe;
- des appels HTTP backend vers l'IA, Open Food Facts, USDA et Voyage AI.

Point de securite obligatoire avant implementation:

- revoquer le jeton Grafana Cloud actuellement expose;
- supprimer les secrets en clair de `monitoring/prometheus.yml` et `monitoring/alloy-config.alloy`;
- injecter les nouveaux secrets uniquement par variables d'environnement ou secret manager.

## 3. Architecture cible

```text
React web
  | HTTP traceparent
  v
Spring Boot backend ---------------------> PostgreSQL
  | traceparent                           Redis
  |                                      APIs externes
  v
FastAPI AI service ----------------------> Anthropic

Spring Boot ---- OTLP/HTTP ----\
FastAPI ------- OTLP/HTTP ------> Grafana Alloy / OTel Collector gateway
                                |---- traces ----> Grafana Tempo / Grafana Cloud Traces
                                |---- logs ------> Grafana Loki / Grafana Cloud Logs
                                |---- metrics ---> Grafana Cloud OTLP metrics si necessaire

Prometheus ---- scrape `/actuator/prometheus` ----> Grafana Cloud Metrics
```

### Decision structurante

Conserver la pipeline Prometheus actuelle pour les metriques Spring Boot deja matures.

Utiliser OTel en priorite pour:

1. traces distribuees;
2. propagation du contexte W3C `traceparent`;
3. correlation logs-traces;
4. metriques generees depuis les traces: RED, service graph et exemplars;
5. metriques applicatives Python absentes aujourd'hui.

Cette coexistence evite les doublons de metriques et limite les risques lors de l'adoption.

## 4. Role de Grafana Alloy

Utiliser Grafana Alloy comme distribution du Collector OpenTelemetry, car SmartLife utilise deja Grafana Cloud et Prometheus.

Alloy devient le point d'entree central:

- receiver OTLP HTTP sur `4318`;
- receiver OTLP gRPC sur `4317` si necessaire;
- processors `memory_limiter`, `batch`, `resource`, `attributes`;
- filtrage des donnees sensibles;
- export OTLP vers Grafana Cloud;
- pipeline Prometheus conserve pour `/actuator/prometheus`;
- plus tard: span metrics, service graphs et tail sampling.

### Local

Ajouter un service `alloy` dans `docker-compose.yml`.

Les applications Docker envoient vers:

```text
http://alloy:4318
```

### Production

Deployer Alloy sur un hote stable accessible par HTTPS:

- VPS;
- Fly.io;
- Railway;
- Render;
- autre plateforme compatible conteneur.

Eviter d'exposer un receiver OTLP public sans authentification. Utiliser TLS et un secret d'ingestion ou un proxy authentifiant.

Une phase initiale peut envoyer directement vers l'endpoint OTLP Grafana Cloud si l'hebergement du gateway retarde le projet. Le gateway Alloy reste la cible recommandee, car il centralise filtrage, batching, retry et evolution.

## 5. Instrumentation backend Spring Boot

### Choix

Commencer avec l'agent Java OpenTelemetry, recommande par la documentation OTel pour Spring Boot lorsqu'un agent JVM est possible.

Ajouter le JAR de l'agent dans l'image runtime du backend et demarrer Java avec:

```bash
JAVA_TOOL_OPTIONS="-javaagent:/opt/otel/opentelemetry-javaagent.jar"
OTEL_SERVICE_NAME=smartlife-backend
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production,service.version=${APP_VERSION}
OTEL_EXPORTER_OTLP_ENDPOINT=https://<alloy-host>
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_TRACES_EXPORTER=otlp
OTEL_METRICS_EXPORTER=none
OTEL_LOGS_EXPORTER=none
OTEL_PROPAGATORS=tracecontext,baggage
```

Pourquoi `OTEL_METRICS_EXPORTER=none` au debut:

- Actuator/Micrometer et Prometheus fonctionnent deja;
- exporter aussi les metriques via OTLP creerait des doublons;
- la migration des metriques pourra etre evaluee plus tard.

### Couverture automatique attendue

- requetes HTTP Spring MVC;
- appels `WebClient`;
- JDBC et PostgreSQL;
- Redis;
- runtime JVM;
- propagation de contexte vers FastAPI et APIs externes.

### Instrumentation manuelle metier

Ajouter ensuite quelques spans manuels utiles, avec faible cardinalite:

- `smartlife.auth.login`;
- `smartlife.auth.verify_otp`;
- `smartlife.ai.prompt.process`;
- `smartlife.food.suggestions.search`;
- `smartlife.food.resolve_portion`;
- `smartlife.social.share.create`;
- `smartlife.push.send`;
- `smartlife.day_score.compute`.

Ajouter comme attributs uniquement:

- statut fonctionnel;
- type de ressource;
- source nutritionnelle;
- fournisseur externe;
- cache hit/miss;
- nombre d'elements;
- duree ou taille bornee.

Ne jamais exporter:

- email;
- nom;
- IP;
- contenu de prompt;
- token JWT;
- refresh token;
- OTP;
- secret interne;
- texte des notes;
- contenu alimentaire libre brut.

### Metriques metier

Conserver `MetricsService` et enrichir progressivement:

- compteur d'appels IA par resultat;
- histogramme de duree IA;
- cache hit ratio nutrition;
- latence des fournisseurs nutritionnels;
- creations de ressources par type;
- erreurs auth par categorie;
- envois push reussis/echecs;
- synchronisations WebSocket.

Utiliser des tags fermes et controles. Ne jamais utiliser `userId`, email, prompt ou URL brute comme label.

## 6. Instrumentation FastAPI

### Installation

Ajouter dans `ai-service/requirements.txt`:

```text
opentelemetry-distro
opentelemetry-exporter-otlp
opentelemetry-instrumentation-fastapi
opentelemetry-instrumentation-requests
opentelemetry-instrumentation-logging
```

Demarrer Uvicorn avec l'auto-instrumentation:

```bash
opentelemetry-instrument \
  uvicorn main:app --host 0.0.0.0 --port 7860
```

Variables:

```bash
OTEL_SERVICE_NAME=smartlife-ai-service
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production,service.version=${APP_VERSION}
OTEL_EXPORTER_OTLP_ENDPOINT=https://<alloy-host>
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_TRACES_EXPORTER=otlp
OTEL_METRICS_EXPORTER=none
OTEL_LOGS_EXPORTER=none
OTEL_PROPAGATORS=tracecontext,baggage
OTEL_PYTHON_FASTAPI_EXCLUDED_URLS=health
OTEL_PYTHON_LOG_CORRELATION=true
```

### Spans manuels

Ajouter des spans courts autour des appels Anthropic:

- `anthropic.prompt.process`;
- `anthropic.food.decompose`;
- `anthropic.food.extract`;
- `anthropic.workout.extract`.

Attributs autorises:

- `ai.operation`;
- modele utilise;
- resultat `success|invalid_json|provider_error`;
- nombre d'elements demandes;
- tokens d'entree/sortie si disponibles;
- cache utilise ou non;
- latence.

Ne pas enregistrer le prompt ou la reponse brute.

## 7. Frontend React

### Recommandation

Ne pas remplacer Sentry immediatement.

L'instrumentation navigateur OTel reste experimentale. Garder Sentry pour:

- erreurs JavaScript;
- performance frontend;
- traces navigateur deja disponibles;
- source maps.

### Integration progressive

Phase optionnelle apres stabilisation backend:

1. verifier si Sentry propage deja `sentry-trace` et `baggage`;
2. activer une propagation W3C `traceparent` controlee sur les appels Axios;
3. autoriser CORS `traceparent`, `tracestate` et `baggage` cote backend;
4. eviter d'envoyer directement des secrets OTLP depuis le navigateur;
5. si une vraie observabilite frontend Grafana devient necessaire, evaluer Grafana Faro avant un SDK OTel web brut.

Le navigateur ne doit jamais contenir de credentials Grafana Cloud.

## 8. Logs

### Etape initiale

Conserver les logs applicatifs existants, mais ajouter la correlation:

- `trace_id`;
- `span_id`;
- `service.name`;
- `deployment.environment`.

Le backend Java peut enrichir Logback via l'agent OTel ou MDC.
Python peut injecter le contexte via `OTEL_PYTHON_LOG_CORRELATION=true`.

### Etape suivante

Collecter les logs avec Alloy et les envoyer vers Loki.

Avant cela:

- nettoyer les logs actuels contenant IP et emails;
- supprimer les logs de debug sensibles;
- definir une politique de retention;
- masquer les secrets, JWT, OTP et donnees personnelles.

## 9. Sampling

### Developpement

```text
OTEL_TRACES_SAMPLER=always_on
```

### Production initiale

```text
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.10
```

Commencer a 10%, puis ajuster selon volume et cout.

### Production avancee

Configurer dans Alloy un tail sampling pour conserver:

- 100% des erreurs;
- traces lentes;
- appels IA;
- erreurs auth;
- echantillon faible des requetes normales.

## 10. Dashboards et alertes

Creer un dossier Grafana `SmartLife Observability`.

### Dashboard 1: Vue globale

- requetes par seconde;
- taux d'erreur;
- latence p50, p95, p99;
- disponibilite backend;
- service graph;
- saturation JVM;
- statut PostgreSQL, Redis et FastAPI.

### Dashboard 2: IA

- appels Anthropic;
- latence par operation;
- erreurs provider;
- JSON invalides;
- tokens consommes;
- cache hit ratio;
- taux de succes par endpoint.

### Dashboard 3: Nutrition

- recherches aliments;
- latence Open Food Facts, USDA, Voyage AI et IA;
- repartition des sources;
- cache hit ratio;
- enrichissements reussis/echecs.

### Alertes initiales

- backend indisponible plus de 2 minutes;
- taux HTTP 5xx superieur a 5% pendant 5 minutes;
- p95 backend superieur a 2 secondes pendant 10 minutes;
- p95 IA superieur a 15 secondes;
- erreurs Anthropic superieures a un seuil;
- erreurs OTP anormalement elevees;
- collector Alloy indisponible;
- files d'export Alloy en croissance.

## 11. Plan d'implementation

### Phase 0 - Hygiene et secrets

1. Revoquer les jetons Grafana exposes.
2. Remplacer les secrets par variables d'environnement.
3. Ajouter un template sans secret.
4. Nettoyer les logs sensibles.

Critere de sortie:

- aucun secret Grafana dans Git ou dans les fichiers partages.

### Phase 1 - Collector local

1. Ajouter Alloy au `docker-compose.yml`.
2. Ajouter `monitoring/config.alloy.template`.
3. Configurer receiver OTLP, batch et exporter debug local.
4. Conserver Prometheus et Grafana.

Critere de sortie:

- Alloy recoit et affiche des traces locales.

### Phase 2 - Backend Spring Boot

1. Ajouter l'agent Java dans l'image Docker.
2. Configurer OTLP par variables d'environnement.
3. Verifier traces HTTP, WebClient, JDBC et Redis.
4. Ajouter 3 a 5 spans metier prioritaires.
5. Ajouter `trace_id` et `span_id` aux logs.

Critere de sortie:

- une requete `/api/prompt` produit une trace backend lisible.

### Phase 3 - FastAPI

1. Ajouter les packages OTel Python.
2. Demarrer via `opentelemetry-instrument`.
3. Exclure `/health`.
4. Ajouter spans Anthropic et attributs de cout.

Critere de sortie:

- une trace `/api/prompt` relie Spring Boot a FastAPI.

### Phase 4 - Production

1. Deployer Alloy gateway securise.
2. Exporter vers Grafana Cloud Tempo.
3. Conserver remote write Prometheus pour les metriques.
4. Ajouter dashboards et alertes.
5. Ajouter sampling et limites de cardinalite.

Critere de sortie:

- traces, metriques et alertes de production exploitables sans secret expose.

### Phase 5 - Logs et frontend

1. Envoyer les logs nettoyes vers Loki.
2. Correlation logs-traces.
3. Evaluer Grafana Faro ou propagation frontend controlee.
4. Conserver Sentry tant que sa valeur reste complementaire.

## 12. Fichiers probablement touches

```text
docker-compose.yml
.env.example
.gitignore
monitoring/config.alloy.template
monitoring/prometheus.template.yml
backend/Dockerfile
backend/start-springboot.sh
backend/src/main/resources/application.yml
backend/src/main/java/com/smartlife/service/*
ai-service/Dockerfile
ai-service/requirements.txt
ai-service/main.py
frontend/src/main.tsx                 # seulement phase frontend optionnelle
frontend/src/api/axios.ts             # seulement phase frontend optionnelle
README.md
```

## 13. Definition of done

L'integration est consideree professionnelle lorsque:

- aucun secret n'est versionne;
- une requete utilisateur est tracable de bout en bout backend vers IA;
- aucune donnee personnelle ou contenu utilisateur n'apparait dans les attributs;
- les metriques Prometheus existantes continuent de fonctionner;
- les logs contiennent `trace_id` et `span_id`;
- les dashboards couvrent latence, erreurs, trafic et saturation;
- les alertes prioritaires sont configurees;
- le collector possede batching, retry et limites memoire;
- la documentation explique le local et la production;
- une procedure de rollback existe: desactiver les variables OTel ou retirer l'agent sans casser l'application.

## 14. Sources officielles utiles

- OpenTelemetry documentation: https://opentelemetry.io/docs/
- Java instrumentation: https://opentelemetry.io/docs/languages/java/instrumentation/
- Java agent: https://opentelemetry.io/docs/zero-code/java/agent/getting-started/
- Spring Boot starter: https://opentelemetry.io/docs/zero-code/java/spring-boot-starter/
- Python zero-code instrumentation: https://opentelemetry.io/docs/zero-code/python/
- Python agent configuration: https://opentelemetry.io/docs/zero-code/python/configuration/
- Browser instrumentation: https://opentelemetry.io/docs/languages/js/getting-started/browser/
- OTLP exporter specification: https://opentelemetry.io/docs/specs/otel/protocol/exporter/
- Grafana Alloy OTLP receiver: https://grafana.com/docs/alloy/latest/reference/components/otelcol/otelcol.receiver.otlp/
- Grafana Alloy tracing architecture: https://grafana.com/docs/tempo/latest/set-up-for-tracing/instrument-send/set-up-collector/grafana-alloy/

## 15. Perimetre exact de la premiere implementation

La premiere implementation doit rester volontairement ciblee.

### Inclus dans le MVP OTel

- traces backend Spring Boot;
- traces FastAPI;
- propagation `traceparent` entre Spring Boot et FastAPI;
- propagation vers PostgreSQL, Redis et fournisseurs HTTP lorsque l'auto-instrumentation le permet;
- Alloy local dans Docker Compose;
- export debug local;
- export Grafana Cloud configurable par variables d'environnement;
- metriques Prometheus existantes conservees;
- correlation des logs avec `trace_id` et `span_id`;
- documentation et procedure de rollback.

### Exclu du MVP OTel

- migration complete des metriques Prometheus vers OTLP;
- remplacement de Sentry;
- instrumentation Android;
- instrumentation navigateur OTel directe;
- collecte Loki de tous les logs;
- tail sampling complexe;
- haute disponibilite Alloy;
- profiling continu avec Pyroscope;
- instrumentation eBPF avec Beyla.

Ces elements restent des evolutions, pas des prerequis pour obtenir une premiere valeur concrete.

## 16. Topologies recommandees

### 16.1 Developpement local minimal

```text
backend:8080 ------------------\
                               \
ai-service:8001 ----------------> alloy:4318 ----> exporter debug
                               /
prometheus:9090 <--- scrape backend:8080/actuator/prometheus
grafana:3000 ------> prometheus:9090
```

Objectif:

- valider les spans sans dependre de Grafana Cloud;
- inspecter la sortie Alloy;
- conserver le developpement hors ligne.

### 16.2 Developpement local avec Grafana Cloud

```text
backend + ai-service ---> alloy local ---> Grafana Cloud OTLP
prometheus local -------- remote_write --> Grafana Cloud Metrics
```

Objectif:

- visualiser les traces dans Tempo;
- tester les credentials par variables d'environnement;
- preparer la production.

### 16.3 Production pragmatique initiale

SmartLife est actuellement deployee sur plusieurs Hugging Face Spaces. Le backend et le service IA ne partagent donc pas necessairement un reseau Docker commun en production.

Architecture recommandee:

```text
backend HF Space ----\
                      \
ai-service HF Space ---> Alloy gateway HTTPS ---> Grafana Cloud OTLP
```

Le gateway Alloy doit etre deploye sur une plateforme persistante. Il recoit OTLP/HTTP sur HTTPS et transmet a Grafana Cloud avec les credentials stockes uniquement cote gateway.

Avantages:

- credentials Grafana absents des applications;
- filtrage centralise;
- retry et batching;
- ajout futur de Loki et sampling sans redeployer chaque service;
- migration possible vers un autre backend compatible OTLP.

### 16.4 Fallback temporaire

Si aucun hebergement Alloy n'est disponible au debut:

```text
backend HF Space ----\
                      >---- OTLP direct HTTPS ----> Grafana Cloud
ai-service HF Space -/
```

Ce mode est acceptable pour valider l'instrumentation, mais il ne doit pas devenir l'architecture finale:

- secrets Grafana dupliques dans plusieurs plateformes;
- moins de controle sur le filtrage;
- plus difficile a faire evoluer;
- couplage plus fort au fournisseur.

## 17. Matrice des signaux

| Source | Traces | Metriques | Logs | Strategie initiale |
|---|---|---|---|---|
| React | Sentry | Sentry/Web Vitals si necessaire | Sentry erreurs | conserver Sentry |
| Spring Boot | OTel Java agent | Actuator + Micrometer + Prometheus | Logback correle | activer MVP |
| FastAPI | OTel Python auto-instrumentation | ajouter plus tard | logging Python correle | activer MVP |
| PostgreSQL | spans JDBC depuis backend | metriques infra plus tard | logs DB hors perimetre | auto-instrumentation |
| Redis | spans client depuis backend | metriques infra plus tard | logs Redis hors perimetre | auto-instrumentation |
| Anthropic | span manuel autour du SDK Python | cout/tokens derives | erreurs masquees | activer MVP |
| Open Food Facts | spans WebClient | latence et erreurs derivees | logs masquees | auto-instrumentation |
| USDA | spans WebClient | latence et erreurs derivees | logs masquees | auto-instrumentation |
| Voyage AI | spans WebClient | latence et erreurs derivees | logs masquees | auto-instrumentation |
| Alloy | auto-observation | metriques internes Alloy | logs Alloy | activer MVP |

## 18. Configuration Alloy locale proposee

Creer `monitoring/config.alloy.template`.

Le template minimal suivant est adapte au premier palier:

```alloy
logging {
  level  = "info"
  format = "logfmt"
}

otelcol.receiver.otlp "smartlife" {
  grpc {
    endpoint = "0.0.0.0:4317"
  }

  http {
    endpoint = "0.0.0.0:4318"
  }

  output {
    traces  = [otelcol.processor.memory_limiter.smartlife.input]
    metrics = [otelcol.processor.memory_limiter.smartlife.input]
    logs    = [otelcol.processor.memory_limiter.smartlife.input]
  }
}

otelcol.processor.memory_limiter "smartlife" {
  check_interval = "1s"
  limit          = "256MiB"
  spike_limit    = "64MiB"

  output {
    traces  = [otelcol.processor.resourcedetection.smartlife.input]
    metrics = [otelcol.processor.resourcedetection.smartlife.input]
    logs    = [otelcol.processor.resourcedetection.smartlife.input]
  }
}

otelcol.processor.resourcedetection "smartlife" {
  detectors = ["env", "system"]

  system {
    hostname_sources = ["os"]
  }

  output {
    traces  = [otelcol.processor.batch.smartlife.input]
    metrics = [otelcol.processor.batch.smartlife.input]
    logs    = [otelcol.processor.batch.smartlife.input]
  }
}

otelcol.processor.batch "smartlife" {
  timeout             = "1s"
  send_batch_size     = 512
  send_batch_max_size = 1024

  output {
    traces  = [otelcol.exporter.debug.smartlife.input]
    metrics = [otelcol.exporter.debug.smartlife.input]
    logs    = [otelcol.exporter.debug.smartlife.input]
  }
}

otelcol.exporter.debug "smartlife" {
  verbosity = "basic"
}
```

Notes:

- `memory_limiter` protege Alloy contre les pointes memoire;
- `batch` reduit le nombre de requetes et ameliore la compression;
- `resourcedetection` ajoute les informations d'environnement;
- l'exporter debug est reserve au local;
- ne pas utiliser `verbosity = "detailed"` durablement: le volume et le risque d'exposer des attributs augmentent.

## 19. Configuration Alloy production proposee

En production, remplacer l'exporter debug par l'exporter OTLP HTTP Grafana Cloud.

```alloy
otelcol.auth.basic "grafana_cloud" {
  username = env("GRAFANA_CLOUD_INSTANCE_ID")
  password = env("GRAFANA_CLOUD_API_KEY")
}

otelcol.exporter.otlphttp "grafana_cloud" {
  client {
    endpoint = env("GRAFANA_CLOUD_OTLP_ENDPOINT")
    auth     = otelcol.auth.basic.grafana_cloud.handler
  }
}
```

Puis connecter `otelcol.processor.batch.smartlife.output`:

```alloy
output {
  traces  = [otelcol.exporter.otlphttp.grafana_cloud.input]
  metrics = [otelcol.exporter.otlphttp.grafana_cloud.input]
  logs    = [otelcol.exporter.otlphttp.grafana_cloud.input]
}
```

Variables a injecter dans l'environnement Alloy:

```dotenv
GRAFANA_CLOUD_OTLP_ENDPOINT=https://otlp-gateway-...grafana.net/otlp
GRAFANA_CLOUD_INSTANCE_ID=...
GRAFANA_CLOUD_API_KEY=...
```

Ne jamais placer ces valeurs dans:

- un fichier versionne;
- un template;
- un Dockerfile;
- un argument de build Docker;
- une capture d'ecran;
- un log de CI;
- une commande imprimee dans une documentation publique.

## 20. Ajout Alloy dans Docker Compose

Ajouter un service local:

```yaml
  alloy:
    image: grafana/alloy:latest
    container_name: smartlife-alloy
    command:
      - run
      - /etc/alloy/config.alloy
      - --server.http.listen-addr=0.0.0.0:12345
    ports:
      - "12345:12345"
      - "4317:4317"
      - "4318:4318"
    volumes:
      - ./monitoring/config.alloy:/etc/alloy/config.alloy:ro
    networks:
      - smartlife-network
```

Le fichier local `monitoring/config.alloy` doit etre ignore par Git.
Le fichier versionne est `monitoring/config.alloy.template`.

Ports:

| Port | Usage |
|---|---|
| `4317` | OTLP/gRPC |
| `4318` | OTLP/HTTP protobuf |
| `12345` | UI de diagnostic Alloy locale |

En production:

- ne pas exposer l'UI Alloy publiquement;
- exposer seulement OTLP HTTPS;
- ajouter authentification ou filtrage reseau;
- fixer une version Alloy au lieu de `latest`.

## 21. Variables d'environnement communes

Chaque service instrumente doit definir:

```dotenv
OTEL_SERVICE_NAME=smartlife-backend
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=local,service.version=dev
OTEL_EXPORTER_OTLP_ENDPOINT=http://alloy:4318
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_PROPAGATORS=tracecontext,baggage
OTEL_TRACES_EXPORTER=otlp
OTEL_METRICS_EXPORTER=none
OTEL_LOGS_EXPORTER=none
OTEL_TRACES_SAMPLER=always_on
```

En production:

```dotenv
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production,service.version=<git-sha>
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.10
```

Convention:

| Attribut | Backend | FastAPI |
|---|---|---|
| `service.name` | `smartlife-backend` | `smartlife-ai-service` |
| `service.namespace` | `smartlife` | `smartlife` |
| `deployment.environment` | `local`, `staging`, `production` | idem |
| `service.version` | SHA Git ou release | SHA Git ou release |

Inclure aussi `service.namespace=smartlife`:

```dotenv
OTEL_RESOURCE_ATTRIBUTES=service.namespace=smartlife,deployment.environment=local,service.version=dev
```

## 22. Backend Java: implementation detaillee

### 22.1 Integration de l'agent dans Docker

Modifier `backend/Dockerfile`.

Dans l'image runtime:

```dockerfile
ARG OTEL_JAVA_AGENT_VERSION=2.28.1

ADD https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v${OTEL_JAVA_AGENT_VERSION}/opentelemetry-javaagent.jar \
    /opt/otel/opentelemetry-javaagent.jar
```

Pour une reproductibilite plus stricte:

- telecharger l'agent dans une etape dediee;
- verifier son checksum SHA-256;
- epingler la version;
- ne pas utiliser l'URL `latest`.

Modifier `backend/start-springboot.sh`:

```bash
JAVA_TOOL_OPTIONS="${JAVA_TOOL_OPTIONS:-} -javaagent:/opt/otel/opentelemetry-javaagent.jar"
export JAVA_TOOL_OPTIONS

exec java -Xms256m -Xmx400m -XX:+UseContainerSupport -jar /app/app.jar
```

Prevoir un rollback simple:

```bash
if [ "${OTEL_ENABLED:-true}" = "true" ]; then
  JAVA_TOOL_OPTIONS="${JAVA_TOOL_OPTIONS:-} -javaagent:/opt/otel/opentelemetry-javaagent.jar"
  export JAVA_TOOL_OPTIONS
fi
```

### 22.2 Auto-instrumentation attendue

Verifier dans Grafana:

- `GET /api/score/today`;
- `POST /api/prompt`;
- requetes SQL;
- appels Redis;
- appels `WebClient` vers FastAPI;
- appels `WebClient` vers fournisseurs nutritionnels;
- statuts HTTP et erreurs.

### 22.3 Instrumentation manuelle Java

Ajouter uniquement l'API OTel compile-time si necessaire:

```xml
<dependency>
  <groupId>io.opentelemetry</groupId>
  <artifactId>opentelemetry-api</artifactId>
</dependency>
```

Exemple de span manuel:

```java
private static final Tracer tracer =
        GlobalOpenTelemetry.getTracer("com.smartlife.backend");

Span span = tracer.spanBuilder("smartlife.ai.prompt.process")
        .setSpanKind(SpanKind.INTERNAL)
        .startSpan();

try (Scope ignored = span.makeCurrent()) {
    span.setAttribute("smartlife.ai.operation", "prompt_process");
    span.setAttribute("smartlife.ai.access_status", entitlementStatus);
    return processPrompt();
} catch (Exception e) {
    span.recordException(e);
    span.setStatus(StatusCode.ERROR);
    throw e;
} finally {
    span.end();
}
```

Regle:

- les spans metier entourent les zones qui apportent une information non visible automatiquement;
- ne pas entourer chaque methode;
- viser quelques spans stables et utiles.

### 22.4 Liste priorisee des spans Java

| Priorite | Span | Emplacement probable | Utilite |
|---|---|---|---|
| P0 | `smartlife.ai.prompt.process` | `AiService` | comprendre latence et erreurs IA |
| P0 | `smartlife.food.suggestions.search` | `FoodLogController` ou service nutrition | analyser recherche alimentaire |
| P0 | `smartlife.food.resolve_portion` | `PortionResolverService` | mesurer precision et sources |
| P1 | `smartlife.auth.login` | `AuthService` | taux de succes auth sans PII |
| P1 | `smartlife.auth.verify_otp` | `AuthService` ou `OtpService` | erreurs OTP |
| P1 | `smartlife.day_score.compute` | `DayScoreService` | latence dashboard |
| P2 | `smartlife.social.share.create` | `SharedLinkController` | partage public |
| P2 | `smartlife.push.send` | `PushNotificationService` | fiabilite push |

## 23. FastAPI: implementation detaillee

### 23.1 Dependencies

Ajouter des versions epinglees apres validation:

```text
opentelemetry-distro
opentelemetry-exporter-otlp
opentelemetry-instrumentation-fastapi
opentelemetry-instrumentation-logging
```

Le SDK Anthropic peut utiliser son propre client HTTP. Verifier l'instrumentation HTTP effectivement installee via:

```bash
opentelemetry-bootstrap
```

Puis ajouter l'instrumentation recommandee, typiquement `httpx` si le SDK l'utilise.

### 23.2 Demarrage Docker

Modifier `ai-service/Dockerfile`:

```dockerfile
CMD [
  "opentelemetry-instrument",
  "uvicorn",
  "main:app",
  "--host", "0.0.0.0",
  "--port", "7860"
]
```

### 23.3 Spans Anthropic

Ajouter un helper unique pour eviter la duplication:

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

tracer = trace.get_tracer("smartlife.ai")

def record_anthropic_call(operation: str):
    return tracer.start_as_current_span(
        f"anthropic.{operation}",
        attributes={
            "gen_ai.system": "anthropic",
            "gen_ai.request.model": "claude-sonnet-4-6",
            "smartlife.ai.operation": operation,
        },
    )
```

Utilisation:

```python
with record_anthropic_call("food.decompose") as span:
    try:
        message = client.messages.create(...)
        span.set_attribute("smartlife.ai.result", "success")
    except anthropic.APIError as exc:
        span.record_exception(exc)
        span.set_status(Status(StatusCode.ERROR))
        span.set_attribute("smartlife.ai.result", "provider_error")
        raise
```

Lorsque `message.usage` est disponible:

```python
span.set_attribute("gen_ai.usage.input_tokens", message.usage.input_tokens)
span.set_attribute("gen_ai.usage.output_tokens", message.usage.output_tokens)
```

Ne jamais attacher:

- `payload.prompt`;
- `raw_text`;
- corps JSON complet;
- noms d'aliments libres;
- identifiant utilisateur;
- header `X-Internal-Key`;
- cle Anthropic.

## 24. Correlation des logs

### 24.1 Backend

Objectif de format:

```text
timestamp level service trace_id span_id logger message
```

Exemple:

```text
2026-06-01T12:00:00Z INFO smartlife-backend trace_id=... span_id=... AiService Prompt processed
```

Commencer par injecter le MDC OTel et conserver stdout.
Ajouter Loki ensuite.

### 24.2 FastAPI

Activer:

```dotenv
OTEL_PYTHON_LOG_CORRELATION=true
OTEL_PYTHON_LOG_FORMAT=%(asctime)s %(levelname)s trace_id=%(otelTraceID)s span_id=%(otelSpanID)s %(name)s %(message)s
```

Verifier le nom exact des champs fournis par la version Python retenue avant commit.

### 24.3 Politique de logs

| Donnee | Autorisee |
|---|---|
| `trace_id`, `span_id` | oui |
| endpoint template `/api/tasks/{id}` | oui |
| statut HTTP | oui |
| type d'operation | oui |
| latence | oui |
| email | non |
| IP brute | non par defaut |
| token | jamais |
| OTP | jamais |
| prompt IA | jamais |
| reponse IA brute | jamais |
| corps HTTP complet | jamais |

## 25. Prometheus et OTel: eviter les doublons

SmartLife expose deja des metriques via Actuator.

Strategie:

### Garder dans Prometheus

- `http_server_requests_seconds`;
- metriques JVM;
- pool de connexions;
- metriques cache;
- metriques Micrometer existantes;
- compteurs `MetricsService`.

### Generer plus tard depuis les traces

- RED metrics inter-services;
- service graph;
- latence backend vers FastAPI;
- latence backend vers fournisseurs externes;
- taux d'erreur par dependance.

### Ne pas faire au MVP

- exporter simultanement toutes les metriques Micrometer vers Prometheus et OTLP;
- dupliquer les memes dashboards avec deux sources;
- ajouter des labels non bornes.

## 26. Span metrics et service graph

Apres stabilisation des traces, ajouter dans Alloy:

```text
otelcol.connector.spanmetrics
otelcol.connector.servicegraph
```

### Span metrics

Produit des metriques RED:

- Request rate;
- Error rate;
- Duration.

Configurer une limite de cardinalite.

### Service graph

Produit une vue des relations:

```text
browser -> smartlife-backend -> smartlife-ai-service -> anthropic
                         \----> postgresql
                         \----> redis
```

Le connecteur service graph doit voir les spans des deux cotes d'une relation. Avec plusieurs instances Alloy, il faudra une strategie de load balancing par trace.

Pour SmartLife a court terme, une seule instance Alloy suffit.

## 27. Tail sampling avance

Ne pas l'activer avant d'avoir mesure le volume reel.

Quand le volume augmente:

```text
receiver -> memory_limiter -> tail_sampling -> batch -> exporter
```

Politique recommandee:

| Trace | Conservation |
|---|---|
| erreur | 100% |
| latence > 3s backend | 100% |
| latence > 15s IA | 100% |
| operation `smartlife.ai.*` | 50% ou 100% selon cout |
| auth failure | 100% avec attributs non sensibles |
| trafic normal | 5% a 10% |

Attention:

- le tail sampling consomme de la memoire;
- tous les spans d'une trace doivent atteindre la meme instance de sampling;
- `memory_limiter` reste obligatoire;
- la volumetrie doit etre mesuree.

## 28. Securite du receiver OTLP

Le receiver OTLP local peut rester sans authentification sur le reseau Docker.

Le receiver de production doit etre protege:

1. TLS obligatoire.
2. Authentification par bearer token ou basic auth.
3. Secret different des credentials Grafana Cloud.
4. Limitation reseau si la plateforme le permet.
5. Rate limiting au proxy.
6. Limite de taille des requetes.
7. Rotation reguliere du secret.
8. Logs d'acces sans corps.

Flux:

```text
application -- secret ingestion --> proxy HTTPS --> Alloy -- secret Grafana --> Grafana Cloud
```

Ne jamais exposer directement les credentials Grafana Cloud aux navigateurs.

## 29. Cardinalite et cout

Le principal risque OTel n'est pas seulement technique: une cardinalite non controlee augmente fortement cout et bruit.

### Valeurs acceptees

- valeurs enumerees;
- statuts;
- nom du service;
- version;
- environnement;
- route template;
- fournisseur externe;
- type de ressource;
- resultat d'operation;
- classe d'erreur normalisee.

### Valeurs interdites

- `user.id`;
- email;
- username;
- IP;
- URL avec query string;
- aliment libre;
- prompt libre;
- note;
- identifiant de partage;
- JWT;
- UUID de requete metier si non necessaire;
- stack trace comme attribut.

### Convention d'attributs SmartLife

```text
smartlife.ai.operation
smartlife.ai.result
smartlife.ai.cache_hit
smartlife.food.source
smartlife.food.result
smartlife.auth.result
smartlife.resource.type
smartlife.push.result
```

Utiliser des valeurs bornees:

```text
success | rejected | invalid_json | provider_error | timeout | cache_hit | cache_miss
```

## 30. Strategie dashboards detaillee

### 30.1 Dashboard SLO backend

Variables:

- environnement;
- version;
- service;
- route.

Panels:

- trafic total;
- taux de succes;
- erreurs 4xx et 5xx;
- latence p50/p95/p99;
- top routes lentes;
- dependances lentes;
- erreurs recentes avec liens vers traces;
- saturation JVM;
- disponibilite `/actuator/health`.

### 30.2 Dashboard IA

Panels:

- appels par operation;
- succes, erreurs provider, JSON invalides;
- latence p50/p95/p99;
- tokens input/output;
- cout estime;
- cache utilisation;
- appels par modele;
- traces lentes;
- taux de quotas refuses cote backend.

### 30.3 Dashboard nutrition

Panels:

- recherches par source;
- latence Open Food Facts;
- latence USDA;
- latence Voyage AI;
- fallback IA;
- cache hit ratio;
- aliments manuels;
- erreurs par fournisseur;
- top chemins de fallback.

### 30.4 Dashboard collector Alloy

Panels:

- receiver accepted/refused spans;
- exporter sent/failed spans;
- batch sizes;
- queue saturation;
- memory limiter refused data;
- consommation CPU et memoire;
- erreurs export OTLP;
- disponibilite Alloy.

## 31. Alertes detaillees

| Nom | Condition initiale | Severite | Action |
|---|---|---|---|
| Backend unavailable | health absent 2 min | critique | verifier HF Space |
| Backend 5xx high | > 5% sur 5 min | haute | inspecter traces erreurs |
| Backend latency | p95 > 2s sur 10 min | moyenne | routes lentes |
| AI latency | p95 > 15s sur 10 min | haute | Anthropic ou payload |
| AI invalid JSON | > 3% sur 15 min | moyenne | prompts systeme |
| Nutrition provider errors | > 10% sur 15 min | moyenne | fournisseur externe |
| Alloy export failures | > 0 durable 5 min | haute | credentials/reseau |
| Alloy refused spans | > 0 durable 5 min | haute | memoire ou saturation |
| OTP failures spike | hausse anormale | securite | verifier abus |

Les seuils doivent etre ajustes apres une semaine de donnees reelles.

## 32. Validation technique

### 32.1 Tests locaux obligatoires

1. Demarrer Alloy local.
2. Demarrer backend et FastAPI avec OTLP active.
3. Appeler `/actuator/health`.
4. Se connecter.
5. Executer un prompt IA.
6. Chercher un aliment.
7. Verifier les traces dans l'exporter debug ou Grafana Cloud.

### 32.2 Trace de reference attendue

```text
POST /api/prompt
  smartlife.ai.prompt.process
    POST smartlife-ai-service/process
      anthropic.prompt.process
```

Pour la nutrition:

```text
GET /api/food-logs/suggestions
  smartlife.food.suggestions.search
    cache lookup
    Open Food Facts ou USDA ou Voyage AI
```

### 32.3 Criteres de non-regression

- build frontend reussi;
- build backend reussi;
- tests backend reussis quand Docker Testcontainers fonctionne;
- `py_compile` reussi;
- flux IA fonctionnel avec OTel desactive;
- flux IA fonctionnel avec OTel active;
- aucune cle ou secret dans `git diff`;
- aucune PII dans les spans exportes;
- Prometheus continue de scraper Actuator.

## 33. Strategie de commits

Ne pas melanger toutes les modifications dans un commit unique.

Ordre recommande:

1. `security: remove exposed observability secrets`
2. `chore(observability): add local alloy collector`
3. `feat(observability): instrument spring backend with otel agent`
4. `feat(observability): instrument fastapi service with otel`
5. `feat(observability): add smartlife domain spans`
6. `docs(observability): document local and production setup`
7. `feat(observability): add grafana dashboards and alerts`

Chaque commit doit rester reversible.

## 34. Rollback

### Backend

```dotenv
OTEL_ENABLED=false
```

Puis redemarrer le backend.

### FastAPI

Remplacer temporairement:

```text
opentelemetry-instrument uvicorn ...
```

par:

```text
uvicorn ...
```

### Alloy

- arreter le conteneur Alloy;
- conserver Prometheus et Grafana;
- les applications doivent continuer de fonctionner si Alloy est indisponible.

### Principe

L'observabilite ne doit jamais etre sur le chemin critique metier.

## 35. Roadmap apres le MVP

### Palier 1

- Java agent;
- Python auto-instrumentation;
- Alloy local;
- traces Grafana Cloud;
- correlation logs.

### Palier 2

- spans metier;
- dashboards;
- alertes;
- span metrics;
- service graph.

### Palier 3

- Loki;
- tail sampling;
- gateway securise;
- retention et budget.

### Palier 4

- Grafana Faro si necessaire;
- profiling Pyroscope;
- eBPF Beyla pour completer l'observabilite infra;
- instrumentation mobile si elle devient prioritaire.
