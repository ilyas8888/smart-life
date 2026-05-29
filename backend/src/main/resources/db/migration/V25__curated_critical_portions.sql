UPDATE food_cache SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
  jsonb_build_object('portions', jsonb_build_object(
    'egg', jsonb_build_object('grams', 50, 'label', '1 large egg', 'source', 'curated', 'confidence', 0.95),
    'large', jsonb_build_object('grams', 56, 'label', '1 extra large egg', 'source', 'curated', 'confidence', 0.9),
    'medium', jsonb_build_object('grams', 44, 'label', '1 medium egg', 'source', 'curated', 'confidence', 0.9),
    'cup', jsonb_build_object('grams', 243, 'label', '1 cup (whole eggs)', 'source', 'curated', 'confidence', 0.9)
  ))
WHERE food_name_normalized = 'egg raw whole' AND source = 'usda';

UPDATE food_cache SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
  jsonb_build_object('portions', jsonb_build_object(
    'piece', jsonb_build_object('grams', 28, 'label', '1 slice', 'source', 'curated', 'confidence', 0.95),
    'slice', jsonb_build_object('grams', 28, 'label', '1 slice', 'source', 'curated', 'confidence', 0.95)
  ))
WHERE food_name_normalized = 'bread white' AND source = 'usda';

UPDATE food_cache SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
  jsonb_build_object('portions', jsonb_build_object(
    'piece', jsonb_build_object('grams', 32, 'label', '1 slice', 'source', 'curated', 'confidence', 0.95),
    'slice', jsonb_build_object('grams', 32, 'label', '1 slice', 'source', 'curated', 'confidence', 0.95)
  ))
WHERE food_name_normalized = 'bread wheat whole' AND source = 'usda';

UPDATE food_cache SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
  jsonb_build_object('portions', jsonb_build_object(
    'tbsp', jsonb_build_object('grams', 14, 'label', '1 tablespoon', 'source', 'curated', 'confidence', 0.95),
    'tsp', jsonb_build_object('grams', 5, 'label', '1 teaspoon', 'source', 'curated', 'confidence', 0.9),
    'serving', jsonb_build_object('grams', 14, 'label', '1 tablespoon', 'source', 'curated', 'confidence', 0.9)
  ))
WHERE food_name_normalized = 'butter unsalted' AND source = 'usda';

UPDATE food_cache SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
  jsonb_build_object('portions', jsonb_build_object(
    'tbsp', jsonb_build_object('grams', 14, 'label', '1 tablespoon', 'source', 'curated', 'confidence', 0.95),
    'tsp', jsonb_build_object('grams', 5, 'label', '1 teaspoon', 'source', 'curated', 'confidence', 0.9)
  ))
WHERE food_name_normalized = 'oil olive' AND source = 'usda';

UPDATE food_cache SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
  jsonb_build_object('portions', jsonb_build_object(
    'tbsp', jsonb_build_object('grams', 14, 'label', '1 tablespoon', 'source', 'curated', 'confidence', 0.95),
    'tsp', jsonb_build_object('grams', 5, 'label', '1 teaspoon', 'source', 'curated', 'confidence', 0.9)
  ))
WHERE food_name_normalized = 'oil sunflower' AND source = 'usda';

UPDATE food_cache SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
  jsonb_build_object('portions', jsonb_build_object(
    'piece', jsonb_build_object('grams', 1, 'label', '1 almond', 'source', 'curated', 'confidence', 0.9),
    'serving', jsonb_build_object('grams', 28, 'label', '1 oz (~23 almonds)', 'source', 'curated', 'confidence', 0.95),
    'cup', jsonb_build_object('grams', 143, 'label', '1 cup', 'source', 'curated', 'confidence', 0.9)
  ))
WHERE food_name_normalized = 'almonds raw' AND source = 'usda';

UPDATE food_cache SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
  jsonb_build_object('portions', jsonb_build_object(
    'piece', jsonb_build_object('grams', 4, 'label', '1 walnut half', 'source', 'curated', 'confidence', 0.9),
    'serving', jsonb_build_object('grams', 28, 'label', '1 oz (~14 halves)', 'source', 'curated', 'confidence', 0.95),
    'cup', jsonb_build_object('grams', 117, 'label', '1 cup', 'source', 'curated', 'confidence', 0.9)
  ))
WHERE food_name_normalized = 'raw walnuts' AND source = 'usda';

UPDATE food_cache SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
  jsonb_build_object('portions', jsonb_build_object(
    'piece', jsonb_build_object('grams', 2, 'label', '1 cashew', 'source', 'curated', 'confidence', 0.85),
    'serving', jsonb_build_object('grams', 28, 'label', '1 oz (~18 cashews)', 'source', 'curated', 'confidence', 0.95)
  ))
WHERE food_name_normalized = 'cashews raw' AND source = 'usda';

UPDATE food_cache SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
  jsonb_build_object('portions', jsonb_build_object(
    'tbsp', jsonb_build_object('grams', 32, 'label', '2 tablespoons', 'source', 'curated', 'confidence', 0.95),
    'tsp', jsonb_build_object('grams', 11, 'label', '1 teaspoon', 'source', 'curated', 'confidence', 0.9)
  ))
WHERE food_name_normalized = 'butter peanut smooth' AND source = 'usda';

UPDATE food_cache SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
  jsonb_build_object('portions', jsonb_build_object(
    'piece', jsonb_build_object('grams', 28, 'label', '1 slice (1 oz)', 'source', 'curated', 'confidence', 0.95),
    'serving', jsonb_build_object('grams', 28, 'label', '1 oz', 'source', 'curated', 'confidence', 0.95)
  ))
WHERE food_name_normalized = 'cheddar cheese' AND source = 'usda';

UPDATE food_cache SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
  jsonb_build_object('portions', jsonb_build_object(
    'piece', jsonb_build_object('grams', 3, 'label', '1 clove', 'source', 'curated', 'confidence', 0.95),
    'serving', jsonb_build_object('grams', 9, 'label', '3 cloves', 'source', 'curated', 'confidence', 0.9)
  ))
WHERE food_name_normalized = 'garlic raw' AND source = 'usda';

UPDATE food_cache SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
  jsonb_build_object('portions', jsonb_build_object(
    'tbsp', jsonb_build_object('grams', 10, 'label', '1 tablespoon', 'source', 'curated', 'confidence', 0.95),
    'serving', jsonb_build_object('grams', 28, 'label', '1 oz (2.5 tbsp)', 'source', 'curated', 'confidence', 0.9)
  ))
WHERE food_name_normalized = 'chia seeds' AND source = 'usda';

UPDATE food_cache SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
  jsonb_build_object('portions', jsonb_build_object(
    'tbsp', jsonb_build_object('grams', 9, 'label', '1 tablespoon', 'source', 'curated', 'confidence', 0.95),
    'serving', jsonb_build_object('grams', 28, 'label', '1 oz', 'source', 'curated', 'confidence', 0.9)
  ))
WHERE food_name_normalized = 'flaxseeds' AND source = 'usda';

UPDATE food_cache SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
  jsonb_build_object('portions', jsonb_build_object(
    'tbsp', jsonb_build_object('grams', 21, 'label', '1 tablespoon', 'source', 'curated', 'confidence', 0.95),
    'tsp', jsonb_build_object('grams', 7, 'label', '1 teaspoon', 'source', 'curated', 'confidence', 0.9)
  ))
WHERE food_name_normalized = 'honey' AND source = 'usda';

UPDATE food_cache SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
  jsonb_build_object('portions', jsonb_build_object(
    'tbsp', jsonb_build_object('grams', 12, 'label', '1 tablespoon', 'source', 'curated', 'confidence', 0.95),
    'tsp', jsonb_build_object('grams', 4, 'label', '1 teaspoon', 'source', 'curated', 'confidence', 0.9)
  ))
WHERE food_name_normalized = 'sugar white' AND source = 'usda';

UPDATE food_cache SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
  jsonb_build_object('portions', jsonb_build_object(
    'piece', jsonb_build_object('grams', 10, 'label', '1 square', 'source', 'curated', 'confidence', 0.85),
    'serving', jsonb_build_object('grams', 40, 'label', '1 bar portion', 'source', 'curated', 'confidence', 0.85)
  ))
WHERE food_name_normalized = '70 chocolate dark' AND source = 'usda';
