UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 5, 'cup', 151))
WHERE food_name_normalized = 'grapes raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 182, 'cup', 125))
WHERE food_name_normalized = 'apple raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 118))
WHERE food_name_normalized = 'banana raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 131, 'cup', 180))
WHERE food_name_normalized = 'orange raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 12, 'cup', 152))
WHERE food_name_normalized = 'raw strawberry' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 2, 'cup', 148))
WHERE food_name_normalized = 'blueberry raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 200, 'cup', 150))
WHERE food_name_normalized = 'avocado raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 336, 'cup', 165))
WHERE food_name_normalized = 'mango raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 178))
WHERE food_name_normalized = 'pear raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 76))
WHERE food_name_normalized = 'kiwi raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 280, 'cup', 152))
WHERE food_name_normalized = 'raw watermelon' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 84, 'cup', 165))
WHERE food_name_normalized = 'pineapple raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 8, 'cup', 147))
WHERE food_name_normalized = 'dates dried' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 110, 'cup', 160))
WHERE food_name_normalized = 'onion raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 61, 'cup', 128))
WHERE food_name_normalized = 'carrot raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 123, 'cup', 180))
WHERE food_name_normalized = 'raw tomato' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 150))
WHERE food_name_normalized = 'boiled potato' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 3))
WHERE food_name_normalized = 'garlic raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 119, 'cup', 149))
WHERE food_name_normalized = 'bell pepper raw red' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 201, 'cup', 119))
WHERE food_name_normalized = 'cucumber raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 196, 'cup', 124))
WHERE food_name_normalized = 'raw zucchini' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 18, 'cup', 70))
WHERE food_name_normalized = 'mushrooms raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 28))
WHERE food_name_normalized = 'bread white' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 28))
WHERE food_name_normalized = 'bread wheat whole' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 1, 'cup', 143))
WHERE food_name_normalized = 'almonds raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', jsonb_build_object('piece', 4, 'cup', 117))
WHERE food_name_normalized = 'raw walnuts' AND source = 'usda';
