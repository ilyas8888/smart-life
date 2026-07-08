 Conclusion
  exception-log-14.md ne contient aucune erreur liée directement à GET /api/score/today.

  Le backend démarre correctement : Keycloak, PostgreSQL, Flyway, Spring Boot et Tomcat sont opérationnels. Aucune
  NullPointerException, erreur SQL ou stack trace DayScoreService n’apparaît.

  Erreur Réellement Présente
  À partir de la ligne 104, le log répète :

  Handshake failed due to invalid Upgrade header: null

  Il s’agit du WebSocket STOMP /ws, pas de /api/score/today.

  Le frontend ouvre cette connexion ici :

  frontend/src/hooks/useNotifications.ts:23

  const wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws'

  Le backend expose bien /ws :

  backend/src/main/java/com/smartlife/config/WebSocketConfig.java:38

  registry.addEndpoint("/ws")

  Mais Nginx transmet les requêtes vers Spring Boot sans propager les en-têtes WebSocket nécessaires :

  backend/nginx.conf:29

  Il manque notamment :

  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";

  Spring reçoit donc une requête /ws classique sans en-tête Upgrade, refuse le handshake, puis le client STOMP réessaie
  périodiquement.

  Concernant /api/score/today
  Le routage est cohérent :

  - Axios ajoute /api : frontend/src/api/axios.ts:5
  - Le composant appelle /score/today : frontend/src/components/SmartDayScore.tsx:83
  - Le contrôleur expose /api/score/today : backend/src/main/java/com/smartlife/controller/DayScoreController.java:19

  Cependant, le composant masque toute erreur réseau ou backend :

  if (isLoading || !data) {
    return <squelette de chargement />
  }

  Après une erreur 401, 403 ou 500, data reste absent. L’interface affiche donc indéfiniment le squelette sans révéler
  la cause.

  Déduction
  Le rapport prouve un défaut de configuration Nginx pour /ws. Il ne permet pas de conclure que /api/score/today échoue.
  Si le score reste bloqué au chargement, il faut récupérer dans l’onglet Network du navigateur la réponse exacte de
  GET /api/score/today : statut HTTP et body. Aucun correctif n’a été appliqué.
