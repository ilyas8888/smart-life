approches claude : 
  ---
  Approche 1 — Static local (recommandée pour PFE)

  Principe : Pré-télécharger ~25 GIFs pour les exercices de EXERCISE_LIBRARY + SVG human body dynamique.

  public/images/exercises/
    deadlift.gif
    squat.gif
    bench-press.gif
    ...

  SVG corps humain → muscles surlignés en amber selon l'exercice

  Avantages : Zéro dépendance externe, 100% offline, fonctionne en démo sans internet.
  Inconvénient : Limité aux exercices pré-mappés (~25), nouveaux exercices = pas d'image.

  ---
  Approche 2 — ExerciseDB API (RapidAPI, free tier)

  Principe : Appel API par nom d'exercice → retourne GIF + liste muscles ciblés.

  GET https://exercisedb.p.rapidapi.com/exercises/name/{exerciseName}
  → { gifUrl, target, secondaryMuscles }

  Avantages : Couvre tous les exercices dynamiquement, GIFs professionnels.
  Inconvénient : Clé API nécessaire, latence réseau, limite 10 req/jour (free tier). Risqué en démo live.

  ---
  Approche 3 — SVG muscle diagram uniquement (sans GIFs)

  Principe : SVG statique corps humain (face + dos) avec zones colorées par exercice.

  const MUSCLE_MAP = {
    'Deadlift': ['lower-back', 'hamstrings', 'glutes'],
    'Squat': ['quads', 'glutes', 'core'],
    'Développé couché': ['chest', 'triceps', 'shoulders'],
    ...
  }

  Avantages : Léger, aucun fichier externe, très visuel.
  Inconvénient : Pas de GIF du mouvement.

  ---

  approche codex :

  Approche recommandée : bibliothèque d’exercices illustrés

  Chaque exercice du programme ou d’une séance doit devenir une fiche visuelle, mais sans charger de GIFs lourds
  partout. L’interface premium doit combiner démonstration du mouvement, muscles ciblés et informations d’exécution.

  ## 1. Fiche exercice

  Dans la séance du jour, le détail du programme et le mode séance, chaque exercice peut ouvrir une fiche comme :

  ┌──────────────────────────────────────────────┐
  │ Deadlift                         Composé      │
  │ Dos • Ischio-jambiers • Fessiers              │
  │                                              │
  │ [ Démonstration du mouvement ] [ Muscles ]    │
  │ [ animation / vidéo courte    ] [ silhouette ]│
  │                                              │
  │ 4 séries × 6 reps       Repos : 120 sec      │
  │                                              │
  │ Conseils techniques                           │
  │ • Garder le dos neutre                        │
  │ • Pousser le sol avec les jambes              │
  │ • Garder la barre proche du corps             │
  └──────────────────────────────────────────────┘

  Sur mobile :

  - média de mouvement en premier ;
  - illustration musculaire dessous ou via un onglet Muscles ;
  - saisie des séries immédiatement accessible ;
  - conseils repliables.

  ## 2. Type de médias

  ### Démonstration du mouvement

  Utiliser prioritairement :

  - une courte vidéo WebM/MP4 en boucle, muette, plutôt qu’un GIF ;
  - ou une séquence d’illustrations statiques position départ / position finale pour la première version.

  Le GIF est simple, mais lourd et de qualité limitée. Une vidéo en boucle est plus nette et généralement plus légère.

  ### Carte musculaire

  Utiliser une illustration SVG ou WebP fixe du corps humain :

  - vue avant ;
  - vue arrière ;
  - muscles principaux en orange fort ;
  - muscles secondaires en orange clair.

  Exemple Deadlift :

  - principaux : fessiers, ischio-jambiers, lombaires ;
  - secondaires : quadriceps, trapèzes, avant-bras, dorsaux.

  ## 3. Architecture des données

  Le backend n’a pas besoin d’être modifié immédiatement. Créer une bibliothèque frontend statique associant un nom
  normalisé à ses contenus visuels :

  interface ExerciseMedia {
    key: string
    aliases: string[]
    displayName: string
    category: string
    movementMedia: {
      type: 'video' | 'image'
      src: string
      poster?: string
    }
    anatomy: {
      front?: string
      back?: string
      primaryMuscles: string[]
      secondaryMuscles: string[]
    }
    instructions: string[]
    cautions?: string[]
    defaultRestSeconds?: number
  }

  const EXERCISE_MEDIA_LIBRARY: Record<string, ExerciseMedia> = {
    deadlift: {
      key: 'deadlift',
      aliases: ['deadlift', 'soulevé de terre', 'souleve de terre'],
      displayName: 'Deadlift',
      category: 'Dos & chaîne postérieure',
      movementMedia: {
        type: 'video',
        src: imgUrl('media/exercises/deadlift/demo.webm'),
        poster: imgUrl('media/exercises/deadlift/poster.webp'),
      },
      anatomy: {
        back: imgUrl('media/exercises/deadlift/muscles-back.webp'),
        primaryMuscles: ['Fessiers', 'Ischio-jambiers', 'Lombaires'],
        secondaryMuscles: ['Trapèzes', 'Avant-bras', 'Quadriceps'],
      },
      instructions: [
        'Placer les pieds sous la barre, largeur de hanches.',
        'Garder le dos neutre pendant toute la montée.',
        'Verrouiller les hanches en position haute.',
      ],
      defaultRestSeconds: 120,
    },
  }

  Ajouter une fonction de résolution tolérante :

  function getExerciseMedia(name: string): ExerciseMedia | null

  Elle doit gérer :

  - Deadlift;
  - Soulevé de terre;
  - variantes avec accents ou majuscules ;
  - Romanian Deadlift, séparé ensuite si un média spécifique existe.

  ## 4. Composants React à créer

  ### ExerciseMediaCard

  Carte affichée dans le détail du programme ou dans une bibliothèque.

  Responsabilités :

  - titre et groupes musculaires ;
  - vignette démonstration ;
  - miniature anatomique ;
  - bouton Voir le mouvement.

  ### ExerciseGuideModal

  Modale premium ouverte depuis une fiche exercice.

  Contenu :

  - vidéo ou images grand format ;
  - onglets Mouvement / Muscles / Technique;
  - muscles principaux et secondaires ;
  - conseils et avertissements ;
  - éventuellement paramètres de la séance.

  ### ActiveExerciseGuide

  Version compacte dans le mode séance plein écran.

  Contenu :

  - vidéo en boucle de l’exercice actif ;
  - muscle ciblé ;
  - séries à enregistrer ;
  - bouton pour afficher la technique complète.

  ## 5. Placement dans le WorkoutPanel

  ### Onglet Aujourd’hui

  Dans TodaySessionBanner, garder la liste compacte. Au clic sur un exercice :

  - ouvrir ExerciseGuideModal;
  - ne pas afficher quatre vidéos directement dans le hero.

  ### Détail du programme

  Dans ProgramDetailView, chaque exercice peut devenir une ligne enrichie :

  [thumbnail] Deadlift             4 × 6
              Fessiers • Ischios   Voir >

  ### Mode séance active

  C’est l’endroit prioritaire pour afficher le mouvement :

  - média de l’exercice courant visible en haut ;
  - changement automatique quand l’exercice change ;
  - toggle Démonstration / Muscles.

  ### Historique

  Ne pas afficher les médias dans les cartes d’historique. Les médias n’apportent pas de valeur pour une séance terminée
  et alourdissent la page.

  ## 6. Gestion des assets

  Organisation proposée :

  frontend/public/media/exercises/
    deadlift/
      poster.webp
      demo.webm
      muscles-back.webp
    bench-press/
      poster.webp
      demo.webm
      muscles-front.webp
    squat/
      poster.webp
      demo.webm
      muscles-front.webp
      muscles-back.webp

  Pour une première version :

  - couvrir les 10 à 15 exercices les plus courants ;
  - afficher une carte générique pour les exercices non couverts ;
  - charger vidéoérience lorsque le média manque

  Un exercice personnalisé ou créé par l’IA n’aura pas toujours une correspondance.

  Fallback :

  Curl câble personnalisé
  Biceps • Bras

  Illustration non encore disponible
  [ Ajouter mes séries ]

  La fiche ne doit jamais échouer ou disparaître parce que le média manque.

  ## 8. Acquisition des images et vidéos

  Il faut éviter de récupérer arbitrairement des GIFs ou planches anatomiques trouvés sur internet : droits d’auteur et
  cohérence graphique.

  Approches propres :

  1. Créer des illustrations cohérentes originales pour les muscles ciblés.
  2. Utiliser des médias sous licence explicitement compatible avec le projet.
  3. Produire de courtes animations originales par exercice ou acheter une bibliothèque sous licence.

  Pour les cartes musculaires, des silhouettes homogènes générées spécifiquement pour SmartLife donneront une apparence
  plus professionnelle que des images provenant de sources différentes.

  ## 9. Mise en œuvre par étapes

  ### Phase 1 : prototype visuel

  - ExerciseMedia et résolution par alias ;
  - assets statiques pour Deadlift, Bench Press, Squat;
  - ExerciseGuideModal;
  - accès depuis la séance du jour et le détail du programme.

  ### Phase 2 : mode entraînement

  - média visible pendant la séance active ;
  - onglet muscles ;
  - conseils techniques et repos recommandé.

  ### Phase 3 : couverture large

  - 15 à 30 exercices principaux ;
  - variantes ;
  - bibliothèque d’exercices consultable ;
  - éventuelle personnalisation IA des recommandations.

  ## Décision technique

  La meilleure approche est donc :

  - médias versionnés dans frontend/public/media/exercises/;
  - catalogue TypeScript local, sans nouvelle API backend au départ ;
  - vidéos courtes WebM plutôt que GIFs ;
  - cartes anatomiques statiques cohérentes ;
  - affichage complet prioritairement dans le mode séance et une modale de guide ;
  - chargement différé pour préserver les performances.

  Cela enrichit fortement l’expérience gym sans transformer chaque écran en galerie lourde ni modifier prématurément le
  backend.
