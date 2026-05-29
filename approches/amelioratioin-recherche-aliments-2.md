Approche Codex :
Pour Alimentation, l’approche la plus solide est de traiter la recherche d’aliments comme un moteur nutritionnel
  hybride, pas comme une simple autocomplete USDA.

  Objectif
  Avoir une recherche rapide, précise, légère, sans Anthropic, avec une expérience proche de Cronometer/MyFitnessPal :

  1. aliments fréquents utilisateur
  2. cache local validé
  3. base nutritionnelle officielle
  4. fallback saisie libre contrôlée
  5. jamais d’IA pendant la recherche

  Approche Recommandée

  Le meilleur modèle pour SmartLife :

  User typing
     ↓
  Local cache first
     ↓
  USDA / OpenFoodFacts search
     ↓
  Ranking intelligent
     ↓
  Selection aliment + portion
     ↓
  Macros calculées localement
     ↓
  Cache enrichi pour prochaine fois

  Sources Nutritionnelles

  Je recommande ce mix :

  - USDA FoodData Central pour les aliments génériques fiables :
      - rice cooked
      - chicken breast
      - egg
      - banana
      - oats
      - olive oil
  - OpenFoodFacts plus tard pour produits scannés / marques :
      - yaourt Danone
      - whey spécifique
      - céréales emballées
      - produits marocains/européens
  - Cache SmartLife comme source prioritaire :
      - aliments déjà utilisés
      - aliments validés
      - aliases
      - hit count
      - last used

  Anthropic ne doit intervenir que pour des repas complexes du type :
  "tajine poulet avec pain et salade"
  Pas pour chicken, rice, banana.

  UX Idéale

  Quand l’utilisateur tape ch :

  Fréquents
  - Chicken breast, cooked
  - Chicken thigh, roasted

  Catalogue
  - Chicken breast, raw
  - Chicken breast, grilled
  - Ground chicken
  - Chicken egg

  Ajouter manuellement
  - Ajouter "ch" tel quel

  Chaque suggestion doit afficher :

  Chicken breast, cooked
  165 kcal · 31g prot · 0g gluc · 3.6g lip / 100g
  Source: USDA

  Après sélection :

  Quantité: [100] [g ▼]
  Repas: Déjeuner
  Calories calculées automatiquement

  Point Clé : Portions

  La précision vient surtout des portions.

  Il faut stocker les valeurs nutritionnelles en base pour 100g, puis calculer :

  calories = caloriesPer100g * quantity / 100
  protein  = proteinPer100g  * quantity / 100
  carbs    = carbsPer100g    * quantity / 100
  fat      = fatPer100g      * quantity / 100

  Ensuite ajouter des unités ergonomiques :

  g
  kg
  ml
  cup
  tbsp
  tsp
  piece
  serving

  Mais en interne, convertir vers grammes quand possible.

  Ranking Important

  Le ranking doit favoriser :

  1. correspondance exacte
  2. commence par la recherche
  3. aliment générique avant marque
  4. aliment avec calories + macros complètes
  5. Foundation / SR Legacy avant Branded
  6. déjà utilisé par l’utilisateur
  7. nom court et clair

  Exemple pour rice :

  Priorité correcte :

  Rice, white, cooked
  Rice, brown, cooked
  Rice, white, raw
  Rice flour
  Rice cake
  Branded rice product

  Pas :

  Rice crackers with cheese flavor
  Organic instant rice pouch with sauce

  Backend Proposé

  Endpoint principal :

  GET /api/food-logs/suggestions?q=rice&limit=10

  Réponse idéale :

  {
    "frequent": [],
    "catalog": [],
    "manual": {
      "label": "Ajouter \"rice\" tel quel"
    }
  }

  Chaque suggestion :

  {
    "id": "usda-168930",
    "name": "Rice, white, cooked",
    "brand": null,
    "source": "USDA",
    "caloriesPer100g": 130,
    "proteinPer100g": 2.7,
    "carbsPer100g": 28.2,
    "fatPer100g": 0.3,
    "servingLabel": "100 g",
    "confidence": 0.94
  }

  Base Locale

  Créer/renforcer food_cache comme vraie table nutritionnelle :

  food_name
  normalized_name
  source
  source_id
  brand
  calories_per_100g
  protein_per_100g
  carbs_per_100g
  fat_per_100g
  aliases
  hit_count
  last_used_at
  verified

  Le cache doit devenir de plus en plus intelligent avec l’usage.

  Frontend

  Composant idéal :

  FoodAutocomplete
  - debounce 250ms
  - min 2 caractères
  - cache React Query
  - keyboard navigation
  - groupes: Fréquents / Catalogue / Manuel
  - macros visibles avant sélection
  - aucun appel IA

  Stratégie Anti-Erreurs

  Pour réduire les mauvaises valeurs :

  - ne pas accepter un aliment sans calories
  - afficher raw / cooked clairement
  - séparer les produits branded des aliments génériques
  - ne jamais inventer une valeur nutritionnelle USDA
  - si ambigu : proposer plusieurs variantes
  - si manuel : marquer comme estimated ou manual

  Ordre D’implémentation

  1. Stabiliser le modèle FoodSuggestion
  2. Améliorer NutritionApiService.searchMultiple()
  3. Ajouter ranking propre côté backend
  4. Améliorer FoodAutocomplete
  5. Ajouter portions/unités
  6. Ajouter cache intelligent par utilisateur
  7. Plus tard : OpenFoodFacts / scan barcode

  Conclusion

  La meilleure approche pour SmartLife :

  USDA + cache local intelligent + ranking strict + portions claires + zéro Anthropic pendant la recherche.

  C’est rapide, peu coûteux, précis, et cohérent avec les apps nutritionnelles professionnelles. L’IA doit rester
  réservée aux repas complexes, pas à la recherche d’aliments simples.

Approche Claude Code :
---
  Diagnostic du système actuel

  Points faibles identifiés :

  ┌───────────────────────────────────────────────────────┬──────────────────────────────────────────────────────┐
  │                       Problème                        │                        Impact                        │
  ├───────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤
  │ USDA FDC API appelée à chaque frappe (même debounced) │ Latence + dépendance réseau                          │
  ├───────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤
  │ quick-add et from-prompt consomment Claude            │ Coût Anthropic + latence 3-5s                        │
  ├───────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤
  │ Autocomplete ne montre pas les valeurs nutritives     │ L'utilisateur choisit "à l'aveugle"                  │
  ├───────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤
  │ Pas de sélection quantité/unité pendant la recherche  │ 2 étapes là où il devrait y en avoir 1               │
  ├───────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤
  │ pgvector/VoyageAI pour le fuzzy search                │ Dépendance API externe pour une feature non-critique │
  ├───────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤
  │ FoodCache vide au démarrage                           │ Les 1ers utilisateurs ont une mauvaise expérience    │
  └───────────────────────────────────────────────────────┴──────────────────────────────────────────────────────┘

  ---
  Approche recommandée — "Offline-first + USDA fallback"

  ┌─────────────────────────────────────────────────────────┐
  │  Couche 1 — FoodCache préchargé (réponse < 10ms)        │
  │  ~300 aliments courants seedés en SQL (migration V19)   │
  │  Légumes, viandes, fruits, céréales, produits laitiers  │
  ├─────────────────────────────────────────────────────────┤
  │  Couche 2 — USDA FDC (fallback, si cache < 3 résultats) │
  │  Appel uniquement si nécessaire + mise en cache auto    │
  │  Priorité : Foundation > SR Legacy (pas Branded)        │
  ├─────────────────────────────────────────────────────────┤
  │  Couche 3 — Entrée manuelle (aliment non trouvé)        │
  │  Formulaire : nom + macros manuellement → 0 API         │
  └─────────────────────────────────────────────────────────┘

  Recherche — pg_trgm au lieu de VoyageAI

  Remplacer la recherche vectorielle par pg_trgm (extension PostgreSQL native, déjà disponible) :
  - similarity('pomme', food_name) > 0.3 → fuzzy matching natif
  - Index GIN → aussi rapide que pgvector, zéro dépendance externe
  - Couvre les fautes de frappe ("pouelt" → "poulet")

  UX autocomplete — afficher les macros inline

  ┌─────────────────────────────────────────────┐
  │ 🔍 poulet                                   │
  ├─────────────────────────────────────────────┤
  │ ✓ Poulet (cuit)         165 kcal/100g       │
  │   P: 31g  G: 0g  L: 3.6g                   │
  │   [100] [g ▼]    → Ajouter                 │
  ├─────────────────────────────────────────────┤
  │ ✓ Poulet rôti           189 kcal/100g       │
  │ ✓ Blanc de poulet       110 kcal/100g       │
  └─────────────────────────────────────────────┘
  Quantité + unité dans la suggestion, pas après. Calcul macros en temps réel côté frontend.

  Supprimer Claude de l'alimentation

  - from-prompt → parseur regex local : "100g poulet", "2 oeufs", "1 bol de riz" → lookup FoodCache + scale macros
  - quick-add → lookup direct USDA/cache par item, pas d'IA
  - Garder l'IA uniquement pour les plats composites non identifiables (optionnel, bouton explicite)

  ---
  Plan d'implémentation — 4 étapes

  ┌───────┬─────────────────────────────────────────────────────────────────┬───────────────────────────────────┐
  │ Étape │                              Quoi                               │             Bénéfice              │
  ├───────┼─────────────────────────────────────────────────────────────────┼───────────────────────────────────┤
  │ 1     │ Migration V19 : seed ~300 aliments courants en SQL              │ Zéro latence pour les cas communs │
  ├───────┼─────────────────────────────────────────────────────────────────┼───────────────────────────────────┤
  │ 2     │ Remplacer VoyageAI par pg_trgm + améliorer ranking USDA         │ Recherche rapide, 0 API externe   │
  ├───────┼─────────────────────────────────────────────────────────────────┼───────────────────────────────────┤
  │ 3     │ Autocomplete enrichi : macros + quantité inline                 │ UX Cronometer-level               │
  ├───────┼─────────────────────────────────────────────────────────────────┼───────────────────────────────────┤
  │ 4     │ Remplacer Claude dans from-prompt + quick-add par parseur local │ 0 consommation Anthropic          │
  └───────┴─────────────────────────────────────────────────────────────────┴───────────────────────────────────┘

  ---