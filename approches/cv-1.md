Approche Claude :
 ---
  Approche recommandée — "Signal fort, 1 page"

  Pas de refonte visuelle. Une réécriture de contenu précise autour de 4 principes :

  1. Profil — affirmatif, pas descriptif

  ▎ Actuellement : "Passionné par l'intégration de l'IA..."
  ▎ → Remplacer par des faits : "3 applications en production réelle, CI/CD complet, monitoring Sentry + SonarCloud"

  2. SmartLife — prouver le niveau prod
  Ajouter une ligne de "signaux techniques" sous la description :
  ▸ Production  ▸ CI/CD GitHub Actions  ▸ Sentry + SonarCloud  ▸ 16 migrations Flyway  ▸ OTP Brevo

  3. Compétences — ajouter la colonne DevOps
  Scinder "DevOps & Outils" en deux lignes distinctes :
  - DevOps : Docker · GitHub Actions · SonarCloud · Sentry · Flyway · pgvector
  - Outils : Git · Maven · Keycloak · Android Studio · Vite

  4. Corriger l'erreur factuelle
  Retirer React d'Aziz Express → JS vanilla

  ---
  Ce que je ne ferais pas
  - Barres de compétences visuelles (infantilisant pour un ingénieur)
  - Passer à 2 colonnes (ATS mal parsé)
  - Ajouter une section "centres d'intérêt"

  ---

  Approche Codex :
   Avis honnête

  Le CV est propre visuellement et montre un profil full-stack riche. Toutefois, pour le recrutement, il présente trois
  faiblesses :

  1. Il fait 2 pages alors que vous êtes en début de carrière. Vos meilleurs arguments risquent d’être moins visibles.
  2. Il mélange trop de projets au même niveau. SmartLife devrait dominer clairement, car c’est votre meilleure preuve
     technique.
  3. Le format actuel est joli, mais moins robuste pour les ATS : photo, icônes, tableau de compétences et mise en page
     graphique peuvent perturber certains parseurs.

  Je recommande de distinguer le rôle du CV et celui du portfolio :

  - CV : rapide, ciblé, lisible en 20 secondes, compatible ATS.
  - Portfolio : démonstrations visuelles, vidéos/GIFs, étude de cas SmartLife, personnalité.

  Cette recommandation est cohérente avec les guides de Harvard SEAS
  (https://seas.harvard.edu/office-student-career-development/resources-undergraduate-students/resumes-portfolios) pour
  un CV technique d’une page en début de carrière, et de CareerOneStop
  (https://cloudfront.careeronestop.org/JobSearch/Resumes/ResumeGuide/formatting.aspx) sur les formats compatibles ATS.

  Approche recommandée

  Créer deux versions coordonnées :

  ### 1. CV candidature ATS, prioritaire

  Un PDF d’une page, sobre, une seule colonne, sans photo ni éléments décoratifs complexes.

  Titre :

  Développeur Full-Stack Java / React | IA appliquée

  Structure :

  Coordonnées + Portfolio + GitHub + LinkedIn
  Profil
  Expérience
  Projet phare : SmartLife
  Autres projets sélectionnés
  Compétences techniques
  Formation et langues

  Ce CV sert pour LinkedIn, plateformes de candidature et envoi aux recruteurs.

  ### 2. CV visuel, secondaire

  Conserver une version plus élégante avec photo et couleur pour :

  - contacts directs ;
  - salons et entretiens ;
  - partage depuis votre portfolio.

  Elle peut inclure un lien ou QR code discret vers l’étude de cas SmartLife.

  Contenu à améliorer

  ### Profil

  Le texte actuel est générique. Il doit expliquer immédiatement votre valeur.

  Proposition :

  Développeur Full-Stack Java / React en dernière année de Génie Informatique,
  actuellement en PFE chez Novelis.io. Je conçois des applications web complètes,
  sécurisées et déployées, avec une spécialisation dans l’intégration pragmatique
  de fonctionnalités IA.

  ### Expérience Novelis

  Votre PFE est mentionné deux fois : dans Expériences et dans Projets. Cela prend de la place inutilement.

  À conserver uniquement dans Expériences, avec des réalisations concrètes :

  Novelis.io | Développeur Full-Stack - PFE | Fév. 2026 - Présent
  - Développement d’un thème Moodle personnalisé basé sur Boost pour une plateforme universitaire.
  - Création d’un plugin local Moodle et d’interfaces de consultation des cours en cartes/liste.
  - Environnement : PHP, SCSS, JavaScript, Docker, méthodologie Agile.

  Évitez d’ajouter Java/Spring Boot et React dans cette expérience si ce n’est pas directement lié aux livrables du PFE.

  ### SmartLife : votre projet phare

  SmartLife doit être présenté comme une preuve d’ingénierie, pas seulement comme une liste de technologies.

  Titre recommandé :

  SmartLife | Projet personnel - Plateforme santé et organisation assistée par IA

  Description recommandée :

  - Développement d’une application full-stack couvrant nutrition, sport, tâches,
    rappels, journal et notes, avec transformation de prompts libres en actions structurées.
  - Architecture React / Spring Boot / FastAPI, authentification Keycloak + JWT + OTP,
    base PostgreSQL migrée avec Flyway.
  - Déploiement GitHub Pages / Hugging Face Spaces / Neon, qualité SonarCloud
    et monitoring Sentry.

  Ajouter trois liens simples :

  Démo | Étude de cas | GitHub

  La mention projet personnel est importante. Dans le portfolio, vous pouvez préciser avec transparence qu’il a été
  développé avec assistance IA.

  ### Projets secondaires

  Ne gardez que deux projets secondaires selon le poste ciblé :

  Pour une candidature Java / Spring Boot :

  - MonLivreur
  - Gestion des produits agricoles

  Pour une candidature React / Frontend :

  - Aziz Express
  - MonLivreur

  Pour une candidature Full-Stack :

  - SmartLife en projet phare
  - MonLivreur
  - Aziz Express

  Le projet Moodle ne doit pas réapparaître dans cette section puisqu’il est déjà votre expérience professionnelle
  principale.

  ### Compétences

  Votre liste actuelle est large, mais donne peu de hiérarchie. La version suivante est plus crédible :

  Backend      Java, Spring Boot, Spring Security, REST API, Python, FastAPI
  Frontend     React, TypeScript, JavaScript, Angular, TailwindCSS
  Données      PostgreSQL, Flyway, Firebase, SQL Server
  Sécurité     Keycloak, OAuth2/OIDC, JWT, OTP
  DevOps       Docker, GitHub Actions, Maven, SonarCloud, Sentry
  IA           Claude API, extraction structurée, intégration LLM

  Retirer :

  - Prompt Engineering et Prompt Caching si vous ne pouvez pas les démontrer clairement en entretien ;
  - la section Soft Skills, qui prend de la place sans preuve concrète.

  Idée créative efficace

  Le CV ne doit pas contenir de démonstrations animées. En revanche, SmartLife peut avoir un appel visuel
  professionnel :

  SMARTLIFE - PROJET PHARE
  Application full-stack déployée | 8 modules | Auth sécurisée | IA appliquée
  [Démo live] [Étude de cas interactive] [Code source]

  Dans le portfolio, l’étude de cas SmartLife peut ensuite présenter :

  - courte vidéo de l’autocomplete nutrition ;
  - création de séance sportive ;
  - prompt IA transformé en données ;
  - architecture technique ;
  - sécurité et déploiement.

  Ainsi, le CV donne envie de cliquer et le portfolio apporte la preuve.

  Plan de mise à jour

  1. Créer cv-fr-ats.tex et cv-en-ats.tex en une page, sans photo ni tableaux complexes.
  2. Réduire les projets à SmartLife + deux projets adaptés au poste.
  3. Réécrire SmartLife autour des fonctionnalités, de l’architecture et du déploiement.
  4. Garder une version visuelle dérivée pour les échanges directs.
  5. Aligner les liens du CV avec la nouvelle étude de cas SmartLife dans le portfolio.
  6. Vérifier le PDF avec extraction texte afin que les ATS lisent correctement sections, dates, technologies et liens.

  Le meilleur repositionnement est donc : un CV court et sélectionné, centré sur Java/React et IA appliquée, qui envoie
  vers une étude de cas SmartLife visuelle dans le portfolio.
