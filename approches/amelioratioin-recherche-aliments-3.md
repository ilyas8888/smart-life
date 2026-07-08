Approche Codex :
 L’approche pro serait de séparer clairement deux concepts :

  1. Nutrition de référence : valeurs pour 100g ou 100ml.
  2. Portions réelles : combien pèse une unité utilisateur comme piece, cup, slice, egg, bowl, etc.

  Aujourd’hui on mélange trop les deux. Résultat : 1 piece egg peut être interprété comme 100g, alors qu’un oeuf moyen
  pèse plutôt autour de 50g.

  Approche recommandée
  Mettre en place un système de portion profile par aliment, avec plusieurs sources et un score de confiance.

  Structure JSON dans nutrition_details :

  {
    "aliases": ["egg raw", "eggs raw"],
    "portions": {
      "piece": {
        "grams": 50,
        "label": "1 egg, medium",
        "source": "usda",
        "confidence": 0.95
      },
      "large": {
        "grams": 56,
        "label": "1 large egg",
        "source": "usda",
        "confidence": 0.95
      }
    }
  }

  Au lieu de stocker seulement :

  "portions": { "piece": 50 }

  C’est plus extensible, plus explicite, et ça permet d’afficher à l’utilisateur : 1 oeuf ≈ 50g.

  Sources gratuites à utiliser
  Priorité par type d’aliment :

  1. USDA FoodData Central pour les aliments bruts/génériques : oeufs, fruits, légumes, riz, viande, pain, noix. USDA
     expose des portions/household measures selon les datasets, notamment Foundation, SR Legacy et FNDDS. Source
     officielle : https://fdc.nal.usda.gov/api-guide/

  2. Open Food Facts pour les produits emballés et marques : yaourt, céréales, fromage industriel, biscuits, boissons.
     OFF fournit serving_size, serving_quantity et des nutriments par portion quand disponibles. Source :
     https://openfoodfacts.github.io/openfoodfacts-server/dev/explain-nutrition-data/

  3. Fallback interne curated pour les unités difficiles ou culturelles : bowl, plate, spoon, slice, piece, aliments
     marocains/français courants.

  4. Fallback générique faible confiance seulement si rien n’est trouvé : piece=100g, cup=240g, etc., mais avec
     confidence: 0.2 et affichage “estimé”.

  Pipeline efficace
  Je ferais ça en 4 étapes.

  1. Importer les portions automatiquement
     Créer un service backend PortionResolverService.

  Quand un aliment USDA est ajouté au cache :

  - récupérer son fdcId;
  - appeler le détail USDA;
  - extraire les portions disponibles : foodPortions, measureUnit, gramWeight, amount;
  - normaliser les noms vers nos unités : egg, piece, slice, cup, tbsp, etc.;
  - écrire dans nutrition_details.portions.

  Pour Open Food Facts :

  - si produit avec barcode ou match fort par nom;
  - lire serving_quantity, serving_size, nutriments;
  - créer une portion serving.

  Exemple :

  "portions": {
    "serving": {
      "grams": 125,
      "label": "1 pot",
      "source": "openfoodfacts",
      "confidence": 0.8
    }
  }

  2. Changer le modèle frontend
     Au lieu d’une unité plate piece, proposer des portions intelligentes selon l’aliment sélectionné.

  Exemple pour oeuf :

  - 100g
  - 1 oeuf moyen ≈ 50g
  - 1 gros oeuf ≈ 56g

  Pour pomme :

  - 100g
  - 1 pomme moyenne ≈ 182g
  - 1 cup ≈ 125g

  Pour yaourt OFF :

  - 100g
  - 1 portion / pot ≈ 125g

  C’est plus intuitif qu’un select global avec piece, cup, bowl identique pour tous les aliments.

  3. Garder un fallback clair
     Si aucune portion fiable n’existe :

  - utiliser UNIT_GRAMS;
  - afficher visuellement “estimé”;
  - permettre correction rapide : “Modifier poids estimé”.

  Exemple UI :
  1 piece ≈ 100g estimé
  Puis l’utilisateur peut changer à 65g, et on peut sauvegarder cette correction localement.

  4. Apprentissage local
     Quand l’utilisateur corrige une portion, on peut stocker :

  "user_portions": {
    "piece": 65
  }

  Ou dans une table dédiée :

  user_food_portion_overrides
  - user_id
  - food_cache_id
  - unit
  - grams

  Ordre de résolution :

  1. override utilisateur;
  2. portion USDA/OFF fiable;
  3. curated internal;
  4. fallback générique.

  Ce que je recommande pour SmartLife maintenant
  Ne pas continuer avec des migrations manuelles aliment par aliment. La bonne suite serait :

  1. Créer une table ou structure JSON enrichie pour portions avec grams, label, source, confidence.
  2. Ajouter un service backend qui enrichit automatiquement food_cache depuis USDA details.
  3. Ajouter Open Food Facts surtout pour les produits emballés, avec serving_quantity.
  4. Modifier le frontend pour afficher des portions propres par aliment, pas seulement des unités globales.
  5. Garder les migrations manuelles uniquement comme seed curated pour les aliments très fréquents.

  Le point clé : le frontend ne doit plus deviner le poids d’une “piece” globalement. C’est le backend qui doit renvoyer
  les portions réalistes spécifiques à l’aliment sélectionné.

Approche Sonnet :
Approche : Script d'enrichissement USDA automatique

  L'API USDA FoodData Central (qu'on utilise déjà) retourne déjà un champ foodPortions pour chaque aliment :

  "foodPortions": [
    {"portionDescription": "1 large", "gramWeight": 50},
    {"portionDescription": "1 cup",   "gramWeight": 243},
    {"portionDescription": "1 tbsp",  "gramWeight": 15}
  ]

  Plan en 3 étapes :

  Étape 1 — Script Python local (scripts/enrich_portions.py)
  - Prend la liste des 90 aliments seedés avec leur fdcId USDA
  - Appelle GET /fdc/v1/food/{fdcId} pour chaque food (DEMO_KEY, gratuit)
  - Mappe automatiquement les descriptions USDA → nos unités (piece, cup, tbsp, tsp, bowl)
  - Génère un fichier V23__enrich_portions.sql complet

  Étape 2 — Review humaine du SQL généré
  - On relit les portions générées (30 secondes par aliment)
  - On corrige les cas ambigus si besoin (ex: "1 slice" = piece pour pain)

  Étape 3 — Migration appliquée en prod
  - Un seul git push + deploy-backend.yml

  ---
  Mapping des descriptions USDA → nos unités :

  ┌──────────────────────────────────────────────────────┬───────────────────────┐
  │                    USDA contient                     │      Notre unité      │
  ├──────────────────────────────────────────────────────┼───────────────────────┤
  │ large / medium / small / whole / fruit / egg / clove │ piece                 │
  ├──────────────────────────────────────────────────────┼───────────────────────┤
  │ cup                                                  │ cup                   │
  ├──────────────────────────────────────────────────────┼───────────────────────┤
  │ tablespoon / tbsp                                    │ tbsp                  │
  ├──────────────────────────────────────────────────────┼───────────────────────┤
  │ teaspoon / tsp                                       │ tsp                   │
  ├──────────────────────────────────────────────────────┼───────────────────────┤
  │ slice                                                │ piece (pain, fromage) │
  ├──────────────────────────────────────────────────────┼───────────────────────┤
  │ bowl                                                 │ bowl                  │
  └──────────────────────────────────────────────────────┴───────────────────────┘

  Résultat pour l'œuf :
  piece: 50g → 1 œuf = 77 kcal ✓ (au lieu de 155)

  ---