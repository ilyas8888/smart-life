Selon Codex 
Cause La Plus Probable
  La capture confirme que GET /api/score/today renvoie réellement :

  {"error":"Erreur interne du serveur","status":500}

  Le problème le plus probable n’est pas l’algorithme de score, mais l’accès Redis utilisé par son cache.

  Pourquoi
  Le tableau de bord charge correctement les autres données :

  - 1 tâche ;
  - 0 rappel ;
  - 518 calories.

  PostgreSQL, l’authentification JWT et les API classiques fonctionnent donc.

  En revanche, DayScoreService.computeForDate() est annoté @Cacheable :

  backend/src/main/java/com/smartlife/service/DayScoreService.java:28

  @Caching(cacheable = {
      @Cacheable(value = "day-score-today", ...),
      @Cacheable(value = "day-score-history", ...)
  })

  L’endpoint calcule sept jours :

  backend/src/main/java/com/smartlife/controller/DayScoreController.java:27

  for (int i = 6; i >= 0; i--) {
      dayScoreService.computeForDate(user.getId(), date);
  }

  En production, si REDIS_URL est défini, le backend active Redis Upstash :

  backend/src/main/resources/application-prod.yml:4

  redis:
    url: ${REDIS_URL:}

  backend/src/main/java/com/smartlife/config/CacheConfig.java:39

  Une erreur de connexion, TLS, authentification ou disponibilité Upstash fait échouer l’appel au cache. Aucun mode
  dégradé vers Caffeine n’est appliqué lorsque Redis existe mais devient inaccessible. L’exception Redis remonte donc
  comme 500.

  Pourquoi Le Log Ne Montre Rien
  Le gestionnaire global absorbe toutes les RuntimeException sans les journaliser :

  backend/src/main/java/com/smartlife/exception/GlobalExceptionHandler.java:56

  @ExceptionHandler(RuntimeException.class)
  public ResponseEntity<...> handleRuntime(RuntimeException ex) {
      return ... "Erreur interne du serveur";
  }

  La stack trace Redis est perdue. Le body générique visible dans Chrome provient précisément de ce handler.

  Hypothèses Écartées

  - Routage frontend : correct.
  - Endpoint backend : correct.
  - Base PostgreSQL : opérationnelle.
  - Colonnes sommeil quality et wake_ups : contraintes NOT NULL par migrations.
  - Erreur WebSocket /ws : réelle mais indépendante du score.

  Déduction
  La cause immédiate est très probablement une défaillance Redis Upstash sur le chemin du cache day-score-*. La cause
  Redis exacte, parmi URL incorrecte, credentials, TLS ou indisponibilité réseau, est actuellement masquée par
  GlobalExceptionHandler. Aucun fichier n’a été modifié.

