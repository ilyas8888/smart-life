  1. Risque sécurité logs production
     backend/src/main/resources/application-prod.yml:19 garde org.springframework.security et OAuth2 en DEBUG. C’est le
     point le plus important à corriger avant nouvelle évolution, car les logs peuvent exposer des détails OAuth/
     session/utilisateur.
  2. Test non suivi avec mot de passe explicite
     backend/src/test/java/com/smartlife/HashGenTest.java:9 contient SmartAdmin2026 et imprime un hash BCrypt. Même si
     le fichier est non suivi, il ne faut pas le committer tel quel.
  3. Sentry backend configuré mais désactivé
     backend/src/main/resources/application-prod.yml:24 contient sentry.enabled: false. Donc même avec SENTRY_DSN, le
     backend ne remonte probablement pas les erreurs en production.
  4. Bundle frontend lourd
     npm.cmd run build passe, mais le JS principal fait environ 755.64 kB. La cause probable est le chargement direct de
     gros composants comme WorkoutPanel / ExerciseGuide. À traiter plus tard par lazy loading/code splitting.
  5. Docker frontend moins reproductible que CI
     frontend/Dockerfile:3 copie seulement package.json puis fait npm install. La CI utilise npm ci. Il faudrait copier
     package-lock.json et utiliser npm ci pour des builds Docker reproductibles.
  6. Service IA à vérifier côté modèle
     ai-service/main.py:149 utilise claude-sonnet-4-6 à plusieurs endroits. Je n’ai pas vérifié la validité actuelle du
     nom modèle côté Anthropic, mais c’est un point à auditer si le service IA échoue en production.
