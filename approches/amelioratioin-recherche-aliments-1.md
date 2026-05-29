Approche Claude: Smart Food Search

  Concept visuel

  Un champ de recherche intelligent avec 3 couches simultanées :

  ┌─────────────────────────────────────┐
  │ 🔍 ch|icken                         │  ← ghost text completion
  └─────────────────────────────────────┘
    ┌───────────────────────────────────┐
    │ ⭐ Récemment utilisés             │
    │   Chicken breast    165 kcal  ✓  │  ← tes aliments
    │   Chicken thigh     209 kcal  ✓  │
    ├───────────────────────────────────┤
    │ 🔎 Suggestions                    │
    │   Ground chicken    143 kcal     │
    │   Chicken sandwich  350 kcal     │
    │   Chicken soup      75 kcal      │
    └───────────────────────────────────┘

  ---
  Les 3 couches

  1. Ghost text (instantané, 0ms)
  → complète le mot en gris clair pendant la frappe, comme un IDE

  2. Récents/Fréquents (immédiat, depuis le cache DB de l'user)
  → ses aliments déjà logués, triés par fréquence + récence

  3. Suggestions élargies (debounce 300ms, API nutrition)
  → résultats USDA/wger pour tout ce qui n'est pas en cache

  ---
  UX details pro

  - Navigation clavier : ↑↓ pour naviguer, Tab pour accepter le ghost text, Enter pour ajouter
  - Macro preview : chaque item montre 165 kcal · P 31g · G 0g · L 4g en petit
  - Sélection quantité inline : après clic sur un aliment, un mini-sélecteur apparaît directement dans la ligne :
  Chicken breast  [100g ▾]  [+ Ajouter]
  - Highlight : les lettres tapées sont surlignées en amber dans les résultats

  ---
  Ce qui se construit

  ┌────────────────────────────────┬─────────────────────────────────────────────┐
  │           Composant            │                 Description                 │
  ├────────────────────────────────┼─────────────────────────────────────────────┤
  │ GET /api/food-logs/search?q=ch │ Backend : cherche dans food_cache de l'user │
  ├────────────────────────────────┼─────────────────────────────────────────────┤
  │ FoodSearchInput.tsx            │ Input + ghost text + dropdown               │
  ├────────────────────────────────┼─────────────────────────────────────────────┤
  │ FoodSearchDropdown.tsx         │ Panel résultats groupés avec macros         │
  └────────────────────────────────┴─────────────────────────────────────────────┘

  ---

  Approche Codex
  Oui. L’approche la plus efficace n’est pas d’ajouter une simple liste déroulante : il faut transformer l’ajout en
  sélecteur alimentaire intelligent, rapide comme une recherche, mais cohérent avec le calcul nutritionnel existant.

  Constat Actuel

  Dans frontend/src/components/FoodLogsPanel.tsx:366, l’utilisateur saisit librement un aliment, une quantité et une
  unité, puis clique sur ajouter. L’analyse ne commence qu’après validation du repas.

  Le backend dispose déjà de briques utiles :

  - backend/src/main/java/com/smartlife/service/FoodCacheService.java:71 conserve les aliments déjà analysés, leurs
    macros et leur fréquence d’utilisation.
  - backend/src/main/java/com/smartlife/service/NutritionApiService.java:36 interroge déjà USDA FoodData Central.
  - backend/src/main/java/com/smartlife/service/AiService.java:221 sait réutiliser le cache avant d’appeler l’IA.

  Point technique important : la normalisation actuelle trie les mots ("chicken breast" devient "breast chicken"). C’est
  utile pour retrouver un aliment exact, mais mauvais pour une recherche par préfixe comme ch ou chick. L’autocomplétion
  doit donc utiliser une recherche textuelle dédiée.

  Concept : Smart Food Finder

  Quand l’utilisateur commence à écrire ch, le champ devient une combobox avec suggestions hiérarchisées :

  Ajouter un aliment
  ┌────────────────────────────────────────────┐
  │ ch                                      ×   │
  └────────────────────────────────────────────┘

  Vos habitudes
    Chicken breast grillé        165 kcal / 100 g   Utilisé 8 fois

  Résultats alimentaires
    Chicken breast, raw           120 kcal / 100 g
    Chicken, ground               143 kcal / 100 g
    Chicken thigh                 179 kcal / 100 g
    Chicken nuggets               296 kcal / 100 g

    + Utiliser "ch" comme aliment personnalisé

  Une sélection remplit automatiquement le nom et propose une quantité appropriée :

  Chicken breast, raw       [ 150 ] [ g ▼ ]    [+ Ajouter]
                            ≈ 180 kcal

  L’utilisateur voit l’estimation avant d’ajouter, sans attendre l’analyse complète du repas.

  Expérience Utilisateur Recommandée

  1. À vide

     Le champ affiche les aliments récents ou fréquents :

     Récents : Banane · Riz cuit · Poulet grillé · Yaourt grec

     C’est plus utile que forcer une recherche pour les habitudes quotidiennes.

  2. Après 2 caractères

     Recherche instantanée avec délai de 200-300 ms :
      - d’abord dans le cache SmartLife ;
      - ensuite dans USDA si le cache n’offre pas assez de résultats ;
      - jamais d’appel IA pendant la frappe.
  3. Résultats groupés

     Trois sections maximum :
      - Fréquents pour vous : aliments déjà consommés.
      - Catalogue nutritionnel : résultats USDA.
      - Créer avec l’IA : option de secours pour un plat complexe, par exemple tajine poulet olives.
  4. Choix d’un aliment

     La ligne sélectionnée renseigne :
      - nom officiel lisible ;
      - calories indicatives par 100 g ou par portion ;
      - unités disponibles : g, piece, cup, etc., lorsque USDA fournit ces portions.
  5. Ajout rapide
      - Flèche bas/haut : naviguer.
      - Entrée : sélectionner ou ajouter.
      - Échap : fermer les suggestions.
      - Sur mobile : cartes tactiles suffisamment hautes.

  Ce comportement correspond au modèle accessible de combobox avec listbox recommandé par le W3C WAI-ARIA.

  Architecture Technique

  Je recommande un endpoint dédié :

  GET /api/food-logs/suggestions?q=ch&limit=8

  Réponse :

  {
    "frequent": [
      {
        "name": "Chicken breast grilled",
        "source": "cache",
        "calories": 165,
        "proteinG": 31,
        "unitBasis": "100 g",
        "hitCount": 8
      }
    ],
    "catalog": [
      {
        "name": "Chicken breast, raw",
        "source": "usda",
        "calories": 120,
        "proteinG": 22.5,
        "unitBasis": "100 g",
        "portions": ["g", "oz"]
      }
    ]
  }

  Backend

  Ajouter une recherche dédiée dans le cache :

  WHERE lower(food_name) LIKE lower(:query || '%')
     OR lower(food_name) LIKE lower('% ' || :query || '%')
  ORDER BY hit_count DESC, last_used_at DESC
  LIMIT 5

  Puis compléter avec USDA uniquement si nécessaire.

  Il ne faut pas utiliser EmbeddingService pour chaque frappe : ce serait plus lent, plus coûteux et inutile pour une
  recherche préfixe. Les embeddings peuvent rester utiles lorsque la recherche exacte échoue, par exemple pour
  comprendre poulet grillé proche de grilled chicken.

  Pour USDA, le service actuel retourne seulement le premier résultat. Il faudrait ajouter une méthode de suggestions
  utilisant pageSize=6, tout en conservant la méthode actuelle pour le calcul final.

  Frontend

  Dans AddFoodModal, remplacer le simple input aliment par un composant :

  <FoodAutocomplete
    value={newFood}
    onSelect={selectSuggestion}
    onCustomValue={setNewFood}
  />

  Le composant utiliserait TanStack Query :

  queryKey: ['food-suggestions', debouncedQuery]
  enabled: debouncedQuery.length >= 2
  staleTime: 5 * 60_000

  La liste doit afficher :

  - nom de l’aliment ;
  - source discrète : Récent ou USDA ;
  - calories ;
  - éventuellement protéines, utiles pour un produit sport/santé.

  Détail Créatif Fort

  Au lieu de seulement proposer des noms, afficher une petite indication de contexte :

  Chicken breast grilled     165 kcal · 31 g prot.     Fréquent
  Chicken thigh              179 kcal · 24 g prot.     Plus riche
  Ground chicken             143 kcal · 17 g prot.     USDA

  Cela transforme l’autocomplétion en aide au choix sans rendre l’écran chargé.

  Après sélection, afficher une estimation dynamique :

  150 g de Chicken breast grilled
  248 kcal · 46.5 g protéines · 5.4 g lipides

  L’utilisateur comprend immédiatement ce qu’il ajoute.

  À Éviter

  - Appeler Claude/AI service à chaque frappe : trop lent, fragile lorsque le Space dort, coûteux.
  - Afficher vingt suggestions sans classement : peu utilisable sur mobile.
  - Mélanger aliments simples et plats préparés sans badge : chicken breast et chicken curry bowl n’ont pas la même
    logique de quantité.
  - Remplacer la saisie libre : l’utilisateur doit toujours pouvoir ajouter un plat inconnu.

  Ordre D’Implémentation

  1. Ajouter endpoint backend de suggestions basé sur food_cache.
  2. Ajouter recherche USDA multi-résultats en complément.
  3. Créer FoodAutocomplete dans le frontend avec debounce et navigation clavier.
  4. Ajouter aperçu calories/macros lors de la sélection.
  5. Plus tard : suggestions personnalisées selon le type de repas et l’heure, par exemple afficher plus souvent les
     aliments de petit-déjeuner le matin.

  C’est une amélioration à fort impact : elle réutilise votre cache et USDA, évite de surcharger l’IA, accélère
  réellement l’ajout quotidien et rend le module Alimentation plus professionnel.

  Sources externes :

  - W3C WAI-ARIA - Combobox Pattern (https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
  - USDA FoodData Central API Guide (https://fdc.nal.usda.gov/api-guide/)
