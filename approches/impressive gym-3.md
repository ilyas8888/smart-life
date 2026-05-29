Approche : enrichir la création de programme sans la surcharger

  Dans CreatePlanModal, l’utilisateur choisit actuellement des exercices pour chaque jour. Le guide illustré doit
  intervenir au moment où il sélectionne et configure les exercices, afin qu’il sache ce qu’il ajoute à son programme.

  ## 1. Bibliothèque d’exercices visuelle

  Lorsqu’un jour est sélectionné, remplacer la simple liste de suggestions par une bibliothèque compacte de cartes.

  Ajouter des exercices à Push

  [ Recherche : deadlift, développé, squat... ]

  ┌──────────────┐ ┌──────────────┐
  │ [image]      │ │ [image]      │
  │ Bench Press  │ │ Dips         │
  │ Pectoraux    │ │ Triceps      │
  │ [ⓘ]  [+]     │ │ [ⓘ]  [+]     │
  └──────────────┘ └──────────────┘

  Chaque carte affiche :

  - miniature de l’exercice si disponible ;
  - nom ;
  - muscle principal ;
  - bouton ⓘ ouvrant ExerciseGuideModal ;
  - bouton + Ajouter.

  Pour un exercice sans média :

  - carte texte standard ;
  - bouton + Ajouter ;
  - pas de bouton guide.

  ## 2. Recherche et filtre

  Ajouter au-dessus de la bibliothèque :

  - champ de recherche par nom ;
  - filtres rapides : Tous, Poitrine, Dos, Jambes, Épaules, Bras, Abdos.

  Cela permet d’utiliser la création manuelle comme un véritable catalogue d’exercices, et pas uniquement les presets
  Push / Pull / Legs.

  Fonction à exposer depuis ExerciseGuide.tsx :

  export function getExerciseCatalog(): ExerciseCatalogItem[]

  ou exporter EXERCISE_DB sous une forme publique adaptée à l’UI.

  ## 3. Exercices déjà ajoutés au jour

  La zone du programme en cours doit afficher une liste enrichie :

  Jour 1 - Push

  ┌────────────────────────────────────┐
  │ [thumb] Développé couché       ⓘ ✕ │
  │ Pectoraux • Triceps                 │
  │ Séries [4] Reps [10] Charge [60kg] │
  └────────────────────────────────────┘

  Contenu de chaque bloc :

  - vignette de mouvement de petite taille ;
  - nom et catégorie ;
  - badges des muscles principaux ;
  - ⓘ pour ouvrir la fiche complète ;
  - champs séries, répétitions et poids ;
  - suppression.

  C’est ici que le bloc d’illustration demandé apporte le plus de valeur dans la création : l’utilisateur voit
  clairement la composition de chaque journée.

  ## 4. Aperçu musculaire de la journée

  Ajouter un panneau résumé pour le jour sélectionné :

  Muscles ciblés aujourd'hui
  [ diagramme anatomique combiné ]

  Principaux : Pectoraux, Épaules, Triceps
  Équilibre : Dominante poussée

  Logique :

  - collecter les muscles des exercices ajoutés ;
  - fusionner les muscles principaux et secondaires ;
  - alimenter MuscleDiagramSVG.

  Cela donne un retour immédiat :

  - une séance Push cible correctement poitrine / épaules / triceps ;
  - une séance jambes ne néglige pas les ischio-jambiers ;
  - l’utilisateur détecte une journée déséquilibrée.

  ## 5. Génération IA

  Après génération d’un programme par IA, ne pas seulement montrer du texte ou des lignes d’exercices. Afficher l’aperçu
  enrichi du programme généré :

  - jours générés ;
  - cartes illustrées par exercice reconnu ;
  - diagramme musculaire par jour ;
  - exercice inconnu conservé avec fallback propre.

  Le modèle IA peut continuer à retourner uniquement les noms/exercices actuels. La correspondance avec les médias reste
  faite côté frontend via getExerciseMedia(). Aucune API backend n’est nécessaire.

  ## 6. Organisation de CreatePlanModal

  La création manuelle peut devenir un parcours en trois étapes :

  ### Étape 1 : Objectif

  - objectif du programme ;
  - durée ;
  - nombre de jours ;
  - génération IA ou configuration manuelle.

  ### Étape 2 : Planning

  - colonnes ou tabs des jours ;
  - bibliothèque visuelle d’exercices ;
  - ajout/retrait ;
  - configuration séries, reps, charge.

  ### Étape 3 : Vérification

  - résumé hebdomadaire ;
  - diagrammes musculaires de chaque séance ;
  - volume total approximatif ;
  - bouton Créer le programme.

  Pour une modification minimale du composant actuel, intégrer uniquement la bibliothèque et les cartes enrichies dans
  son étape existante de choix des exercices.

  ## 7. Mobile

  Dans une modale mobile, éviter deux panneaux côte à côte.

  Ordre recommandé :

  1. sélecteur de jour horizontal ;
  2. exercices ajoutés à la journée ;
  3. résumé musculaire repliable ;
  4. bouton Ajouter un exercice ouvrant un bottom sheet de bibliothèque ;
  5. guide complet en seconde modale.

  Sur desktop, la bibliothèque peut apparaître à gauche et la journée construite à droite.

  ## 8. Composants à ajouter

  Dans ExerciseGuide.tsx :

  export function ExerciseThumbnail(...)
  export function DayMuscleSummary(...)
  export function getExerciseCatalog(...)

  Dans WorkoutPanel.tsx ou fichier séparé :

  function ExercisePicker(...)
  function SelectedExerciseCard(...)

  Responsabilités :

  - ExercisePicker : recherche, filtres, ajout.
  - SelectedExerciseCard : paramétrage de l’exercice ajouté.
  - DayMuscleSummary : anatomie combinée du jour.
  - ExerciseGuideModal : détail complet déjà disponible.

  ## 9. Implémentation progressive recommandée

  ### Version 1

  - Ajouter ExerciseInfoButton à chaque exercice déjà sélectionné dans CreatePlanModal.
  - Ajouter une vignette si le média existe.
  - Afficher les muscles principaux sous le nom.

  ### Version 2

  - Transformer les suggestions d’exercices en cartes visuelles avec ajout direct.
  - Ajouter recherche et filtres.

  ### Version 3

  - Ajouter résumé musculaire combiné de chaque journée et aperçu de validation du programme.

  ## Décision pratique

  La prochaine modification à réaliser devrait être la Version 1 :

  - faible risque ;
  - aucune nouvelle API ;
  - réutilisation directe de getExerciseMedia et ExerciseInfoButton ;
  - amélioration visible dans la création manuelle immédiatement ;
  - base solide avant de transformer complètement le sélecteur en bibliothèque.

  Ensuite, la Version 2 donnera l’effet premium attendu : choisir un exercice par son visuel, ses muscles ciblés et sa
  technique, comme dans une application de coaching moderne.
