Approche Study Tracking
  Le vrai problème à résoudre n’est pas “enregistrer que j’ai étudié 2h”. C’est plutôt:

  > “Je veux apprendre régulièrement, savoir quoi réviser, rester concentré, et voir si mes efforts produisent du
  > progrès.”

  Donc le module Study doit être un système d’apprentissage guidé, pas juste un chronomètre.

  Concept Recommandé
  Créer une section Apprentissage avec 4 blocs:

  1. Sessions
      - matière/projet
      - durée
      - objectif
      - concentration
      - notes
      - résultat obtenu

  2. Plans d’apprentissage
      - objectif global: “Java Spring”, “React”, “Anglais”, “DSO”
      - deadline optionnelle
      - sous-objectifs
      - progression

  3. Révisions intelligentes
      - prochaine date de révision
      - niveau de maîtrise
      - rappel automatique
      - logique simple de spaced repetition

  4. Insights
      - meilleur créneau d’étude
      - temps total semaine
      - concentration moyenne
      - streak
      - sujets à revoir

  MVP Très Fort
  Je commencerais par un MVP qui donne de la valeur dès le premier jour:

  - bouton Démarrer une session
  - choix du sujet: Java, React, Anglais, Mémoire, etc.
  - objectif de session: “finir le chapitre OAuth2”
  - timer focus avec pause
  - à la fin:
      - durée réelle
      - concentration 1-5
      - difficulté 1-5
      - résumé de ce qui a été appris
      - prochaine action

  C’est plus utile qu’un formulaire classique.

  UX Idéale
  Écran principal:

  - carte “Session en cours”
  - bouton Démarrer
  - sélection rapide du sujet
  - timer focus
  - notes rapides pendant la session

  Après fin session:

  - modal de clôture:
      - “Qu’as-tu appris ?”
      - “À revoir ?”
      - “Prochaine étape ?”
      - concentration / difficulté

  Ensuite dashboard:

  - heures cette semaine
  - streak d’apprentissage
  - top sujets
  - progression par objectif
  - liste “À réviser bientôt”

  Modèle Mental
  Le module doit répondre à ces questions:

  1. Qu’est-ce que j’apprends ?
  2. Combien de temps j’y consacre ?
  3. Est-ce que je progresse ?
  4. Qu’est-ce que je dois revoir ?
  5. Quelle est ma prochaine action claire ?

  Données Backend
  Tables recommandées:

  study_topics
  - id
  - user_id
  - name
  - color
  - goal
  - target_hours
  - deadline
  - created_at
  - updated_at

  study_sessions
  - id
  - user_id
  - topic_id
  - title
  - started_at
  - ended_at
  - duration_minutes
  - focus_score
  - difficulty_score
  - notes
  - learned
  - next_step
  - created_at

  study_reviews
  - id
  - user_id
  - topic_id
  - session_id
  - review_date
  - mastery_score
  - status
  - notes

  Spaced Repetition Simple
  Quand une session est terminée, si l’utilisateur coche “À revoir”, créer automatiquement des reviews:

  J+1
  J+3
  J+7
  J+14

  Puis selon mastery score:

  - maîtrise faible → prochaine révision plus proche
  - maîtrise forte → prochaine révision plus loin

  Fonction Assistant
  Sans IA au début:

  - générer des recommandations locales:
      - “Tu n’as pas révisé Spring depuis 6 jours.”
      - “Tes sessions du matin ont une meilleure concentration.”
      - “React avance bien: 4h cette semaine.”
      - “Prochaine action: relire OAuth2.”

  Avec IA plus tard:

  - transformer notes en fiches de révision;
  - générer quiz;
  - résumer une session;
  - proposer plan d’étude.

  Smart Day Score
  Study peut aussi contribuer au Smart Day Score:

  studyScore =
  sessionCompleted ? 60 :
  plannedButNotDone ? 20 :
  noStudyPlanned ? neutral

  Bonus:

  - +20 si objectif atteint
  - +10 si review faite
  - +10 si focus >= 4

  Mais je ne le mettrais pas trop tôt dans le score global sauf si l’utilisateur active un objectif apprentissage.

  Priorité D’implémentation
  Phase Study 1:

  - CRUD topics
  - start/stop session
  - weekly stats
  - session history

  Phase Study 2:

  - reviews / spaced repetition
  - focus insights
  - next action

  Phase Study 3:

  - IA: quiz, flashcards, résumé, plan automatique

  Approche la plus efficace
  Je recommande de construire d’abord:

  > Study Sessions + Topics + Review Queue

  C’est le cœur. Le reste vient naturellement après.

  Ce module deviendra très fort si chaque session se termine par une réponse claire:

  > “Qu’est-ce que je dois faire ensuite ?”

  C’est ça qui transforme SmartLife en assistant, pas seulement en tracker.

