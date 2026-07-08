Approche Codex :
 Approche Social SmartLife
  Le social ne doit pas devenir un “réseau social général”. Ce serait lourd, risqué, et peu aligné avec SmartLife.

  L’approche la plus forte est:

  > Social = coordination utile + partage contrôlé + accountability privée

  SmartLife aide déjà une personne à organiser sa vie. Le social doit aider quand cette vie implique d’autres personnes:
  sport, études, tâches, famille, projets, routines.

  Problèmes Réels À Résoudre

  1. “Je veux partager une tâche ou une liste sans screenshot.”
  2. “Je veux suivre un objectif avec quelqu’un.”
  3. “Je veux envoyer mon programme sport/recette/journal précis à une personne.”
  4. “Je veux collaborer sur une routine ou un projet.”
  5. “Je veux garder le contrôle sur ce qui est privé.”

  Donc priorité: partage par lien + cercles privés, pas feed public.

  Concept Recommandé
  Créer un module Partage ou Cercles avec 3 niveaux:

  1. Liens partageables
      - partager une tâche;
      - un jour d’agenda;
      - une recette/aliment;
      - un programme sport;
      - une note;
      - une session study;
      - un résumé de journée.

  2. Cercles privés
      - famille;
      - binôme étude;
      - coach sport;
      - équipe projet;
      - amis proches.

  3. Accountability
      - objectifs partagés;
      - check-ins;
      - progression visible;
      - encouragements simples, pas de likes publics.

  MVP Très Fort
  Je recommande de commencer par:

  ### Phase Social 1 — Share Links

  Un système générique de partage contrôlé.

  L’utilisateur peut cliquer Partager sur:

  - tâche;
  - note;
  - programme sport;
  - recette/aliment;
  - journée;
  - session study.

  Options:

  - lecture seule;
  - expiration: 24h, 7 jours, jamais;
  - accès public par lien ou privé utilisateur SmartLife;
  - révocable à tout moment.

  Backend:

  shared_links
  - id
  - owner_id
  - resource_type
  - resource_id
  - token
  - title
  - permissions
  - expires_at
  - revoked
  - created_at

  Endpoints:

  POST   /api/shares
  GET    /api/shares
  GET    /api/public/shares/{token}
  DELETE /api/shares/{id}

  Frontend:

  - bouton Partager;
  - modal simple;
  - copie lien;
  - page publique read-only propre.

  C’est immédiatement utile, professionnel, et simple à sécuriser.

  Phase Social 2 — Cercles Privés
  Après les liens, ajouter les cercles:

  circles
  - id
  - owner_id
  - name
  - type
  - created_at

  circle_members
  - id
  - circle_id
  - user_id
  - role
  - status

  Cas d’usage:

  - cercle “Study Partner”;
  - cercle “Coach”;
  - cercle “Famille”;
  - cercle “Projet”.

  Fonctions:

  - inviter par email;
  - accepter/refuser;
  - partager une ressource avec un cercle;
  - permissions par cercle.

  Phase Social 3 — Accountability
  Le plus intéressant pour SmartLife:

  Exemples:

  - “On étudie 5h cette semaine.”
  - “On fait 3 séances sport.”
  - “On dort avant minuit 5 jours.”
  - “On termine 10 tâches projet.”

  Table:

  shared_goals
  - id
  - circle_id
  - owner_id
  - title
  - metric_type
  - target_value
  - period
  - start_date
  - end_date

  UI:

  - progress bar collective;
  - check-ins;
  - commentaire court;
  - badge “objectif atteint”.

  Pas de feed infini. Pas de bruit.

  Expérience Créative
  Créer une page Together:

  - “Partagé avec moi”
  - “Mes liens actifs”
  - “Mes cercles”
  - “Objectifs partagés”
  - “Check-ins du jour”

  Chaque carte doit répondre à:

  - qui partage ?
  - quoi ?
  - pourquoi ?
  - jusqu’à quand ?
  - que puis-je faire ?

  Privacy By Design
  Indispensable.

  Règles:

  - par défaut tout reste privé;
  - aucun partage automatique;
  - chaque lien est révocable;
  - expiration par défaut 7 jours;
  - page publique read-only;
  - pas de données sensibles dans l’URL sauf token opaque;
  - audit minimal: vues, date dernière vue;
  - éviter partage du journal personnel complet au début.

  Ce Qu’il Ne Faut Pas Faire Maintenant
  À éviter:

  - feed public;
  - likes;
  - follow system;
  - messagerie complète;
  - commentaires partout;
  - profils publics;
  - ranking entre utilisateurs.

  Ça ajoute beaucoup de complexité, modération, sécurité, et peu de valeur immédiate.

  Roadmap Recommandée

  1. Sharing par lien
      - architecture générique;
      - page publique;
      - révocation;
      - expiration.

  2. Shared with me
      - recevoir ressources partagées entre utilisateurs SmartLife.

  3. Cercles privés
      - famille, study partner, coach, équipe.

  4. Shared goals
      - accountability mesurable.

  5. Social léger
      - commentaires courts;
      - réactions limitées;
  > Generic Share Links + Public Read-Only Viewer

  Pourquoi:

  - valeur immédiate;
  - peu de dépendances;
  - utile pour portfolio;
  - montre sécurité et architecture;
  - réutilisable pour tous les modules;
  - prépare Cercles et Social.

  Positionnement Portfolio
  Très fort à présenter:

  > “J’ai conçu un système de partage sécurisé et réutilisable permettant d’exposer temporairement des ressources
  > personnelles via liens révocables, sans compromettre la confidentialité par défaut.”

  C’est plus professionnel qu’un simple réseau social.

Approche Claude Code :
 Approche Social SmartLife

  Le vrai problème

  Un réseau social classique (feed, likes, abonnés) = 3 mois de dev + modération + confidentialité. Trop lourd, trop
  risqué pour le scope.

  Le vrai besoin social de SmartLife n'est pas "poster" — c'est "partager ce qu'on a construit".

  Les utilisateurs créent des choses de valeur : programmes sport, plans d'étude, routines alimentaires, templates de
  tâches. Le social utile ici c'est partager ces artefacts, pas publier des statuts.

  ---
  Concept : "SmartLife Connect" — 3 phases courtes

  ---
  Phase S1 — Liens partageables (1 table, 2 endpoints)

  N'importe quel artefact devient partageable via URL :
  - Programme sport → smartlife.app/share/abc123
  - Plan d'étude → lien public lecture seule
  - Journée alimentaire → résumé macros partageable

  share_tokens (id, user_id, entity_type, entity_id, token UUID, expires_at, view_count)

  - POST /api/share → génère token, retourne URL
  - GET /api/public/share/{token} → vue publique sans auth
  - Bouton "Partager" sur programmes, plans, journée food
  - Vue publique : propre, sans sidebar, avec bouton "Créer mon compte SmartLife"

  Valeur : viral naturel — quelqu'un partage son programme sport sur WhatsApp, ses amis découvrent SmartLife.

  ---
  Phase S2 — Défis de groupe (accountability privée)

  Pas de réseau public. Un cercle fermé d'amis sur un objectif commun :
  - "30 jours de sport", "7h de sommeil pendant 2 semaines", "100h d'étude ce mois"
  - L'initiateur crée le défi + génère un code d'invitation
  - Les participants voient leurs progressions mutuelles (pas le monde entier)

  challenges (id, creator_id, title, type, target, start_date, end_date, invite_code)
  challenge_participants (id, challenge_id, user_id, joined_at, progress)

  Valeur : accountability réelle sans exposition publique. C'est ce qui fait tenir les bonnes habitudes.

  ---
  Phase S3 — Profil public sélectif

  L'utilisateur choisit ce qu'il expose :
  - Programmes sport créés (clonables par d'autres)
  - Smart Day Score sur 30 jours (graphique anonymisé)
  - Badge "streak sommeil 14 jours", "10 sessions étude ce mois"

  Pas de feed, pas de commentaires — une carte de profil partageable. Les autres peuvent cloner un programme directement
  dans leur compte.

  ---
  Ce que ça évite

  ┌───────────────────────────────┬──────────────────────────────────────────┐
  │       Complexité évitée       │                 Pourquoi                 │
  ├───────────────────────────────┼──────────────────────────────────────────┤
  │ Feed algorithmique            │ Modération, toxicité, coût infra         │
  ├───────────────────────────────┼──────────────────────────────────────────┤
  │ Système de likes/commentaires │ Modération + distraction du core product │
  ├───────────────────────────────┼──────────────────────────────────────────┤
  │ Notifications push sociales   │ Complexité infra                         │
  ├───────────────────────────────┼──────────────────────────────────────────┤
  │ Messagerie                    │ Hors scope totalement                    │
  └───────────────────────────────┴──────────────────────────────────────────┘

  ---
  Ordre recommandé

  S1 d'abord — valeur immédiate, 1 journée de dev, impact viral direct.
  S2 ensuite — feature différenciante, personne dans les apps de productivité n'a ça bien fait.
  S3 en dernier — polish, utile pour la démo PFE.

  ---
