UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"piece": {"confidence": 0.95, "grams": 15.0, "label": "1 piece", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'breast chicken cooked' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'chicken cooked thigh' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'breast chicken raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'beef cooked ground lean' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'beef cooked sirloin' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'cooked salmon' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'canned tuna water' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 136.0, "label": "1 cup, chopped", "source": "usda"}, "large": {"confidence": 0.95, "grams": 50.0, "label": "1 large", "source": "usda"}, "tbsp": {"confidence": 0.95, "grams": 8.5, "label": "1 tbsp", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'egg hardboiled whole' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 243.0, "label": "1 cup", "source": "usda"}, "large": {"confidence": 0.95, "grams": 33.0, "label": "1 large", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'egg raw white' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'cooked shrimp' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'breast cooked turkey' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'cod cooked' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 149.0, "label": "1 cup, drained", "source": "usda"}, "small": {"confidence": 0.95, "grams": 12.0, "label": "1 small (2-2/3\" x 1/2\" x 1/4\")", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'canned oil sardines' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 198.0, "label": "1 cup", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'cooked lentils' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 164.0, "label": "1 cup", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'chickpeas cooked' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 172.0, "label": "1 cup", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'beans black cooked' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'firm tofu' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = '0 fat greek plain yogurt' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = '2 cheese cottage fat' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 174.0, "label": "1 cup", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'cooked rice white' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 155.0, "label": "1 cup", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'brown cooked rice' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 107.0, "label": "1 cup rotini", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'cooked pasta' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"slice": {"confidence": 0.95, "grams": 28.0, "label": "1 slice", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'bread white' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"large": {"confidence": 0.95, "grams": 64.0, "label": "1 pita, large (6-1/2\" dia)", "source": "usda"}, "small": {"confidence": 0.95, "grams": 28.0, "label": "1 pita, small  (4\" dia)", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'bread wheat whole' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 219.0, "label": "1 cup", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'cooked oats rolled' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 185.0, "label": "1 cup", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'cooked quinoa' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 78.0, "label": "0.5 cup", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'boiled potato' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 64.0, "label": "1 cup", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'cooked potato sweet' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 528.0, "label": "1 cup, dry, yields", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'cooked couscous' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 149.0, "label": "1 cup", "source": "usda"}, "large": {"confidence": 0.95, "grams": 118.0, "label": "1 ear large (7-3/4\" to 9\" long)", "source": "usda"}, "medium": {"confidence": 0.95, "grams": 103.0, "label": "1 ear medium (6-3/4\" to 7-1/2\" long)", "source": "usda"}, "small": {"confidence": 0.95, "grams": 89.0, "label": "1 ear small (5-1/2\" to 6-1/2\" long)", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'corn cooked yellow' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"piece": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'broccoli raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 30.0, "label": "1 cup", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'raw spinach' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"piece": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'raw tomato' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 110.0, "label": "1 cup grated", "source": "usda"}, "large": {"confidence": 0.95, "grams": 7.0, "label": "1 strip large (3\" long)", "source": "usda"}, "medium": {"confidence": 0.95, "grams": 61.0, "label": "1 medium", "source": "usda"}, "slice": {"confidence": 0.95, "grams": 3.0, "label": "1 slice", "source": "usda"}, "small": {"confidence": 0.95, "grams": 50.0, "label": "1 small (5-1/2\" long)", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'carrot raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 160.0, "label": "1 cup, chopped", "source": "usda"}, "large": {"confidence": 0.95, "grams": 150.0, "label": "1 large", "source": "usda"}, "medium": {"confidence": 0.95, "grams": 14.0, "label": "1 slice, medium (1/8\" thick)", "source": "usda"}, "slice": {"confidence": 0.95, "grams": 115.0, "label": "1 cup, sliced", "source": "usda"}, "small": {"confidence": 0.95, "grams": 70.0, "label": "1 small", "source": "usda"}, "tbsp": {"confidence": 0.95, "grams": 10.0, "label": "1 tbsp chopped", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'onion raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"piece": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'garlic raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"piece": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'bell pepper raw red' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 133.0, "label": "1 cup, pared, chopped", "source": "usda"}, "large": {"confidence": 0.95, "grams": 280.0, "label": "1 large (8-1/4\" long)", "source": "usda"}, "medium": {"confidence": 0.95, "grams": 201.0, "label": "1 medium", "source": "usda"}, "slice": {"confidence": 0.95, "grams": 7.0, "label": "1 slice", "source": "usda"}, "small": {"confidence": 0.95, "grams": 158.0, "label": "1 small (6-3/8\" long)", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'cucumber raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.2, "grams": 30, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'lettuce raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"large": {"confidence": 0.95, "grams": 16.0, "label": "1 large", "source": "usda"}, "medium": {"confidence": 0.95, "grams": 11.0, "label": "1 medium", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'raw zucchini' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"piece": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'cauliflower raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 54.0, "label": "1 cup", "source": "usda"}, "piece": {"confidence": 0.95, "grams": 5.4, "label": "1 piece", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'mushrooms raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 82.0, "label": "1 cup, cubes", "source": "usda"}, "egg": {"confidence": 0.95, "grams": 548.0, "label": "1 eggplant, unpeeled (approx 1-1/4 lb)", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'eggplant raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 125.0, "label": "1 cup", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'beans cooked green' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 90.0, "label": "0.5 cup", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'asparagus cooked' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 160.0, "label": "1 cup", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'cooked peas' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 21.0, "label": "1 cup", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'kale raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"piece": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'celery raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"piece": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'apple raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 225.0, "label": "1 cup, mashed", "source": "usda"}, "large": {"confidence": 0.95, "grams": 152.0, "label": "1 extra large (9\" or longer)", "source": "usda"}, "medium": {"confidence": 0.95, "grams": 118.0, "label": "1 medium (7\" to 7-7/8\" long)", "source": "usda"}, "serving": {"confidence": 0.95, "grams": 126.0, "label": "1 NLEA serving", "source": "usda"}, "slice": {"confidence": 0.95, "grams": 150.0, "label": "1 cup, sliced", "source": "usda"}, "small": {"confidence": 0.95, "grams": 101.0, "label": "1 small (6\" to 6-7/8\" long)", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'banana raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"tbsp": {"confidence": 0.95, "grams": 6.0, "label": "1 tbsp", "source": "usda"}, "tsp": {"confidence": 0.95, "grams": 2.0, "label": "1 tsp", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'orange raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 232.0, "label": "1 cup, pureed", "source": "usda"}, "large": {"confidence": 0.95, "grams": 18.0, "label": "1 large (1-3/8\" dia)", "source": "usda"}, "medium": {"confidence": 0.95, "grams": 12.0, "label": "1 medium (1-1/4\" dia)", "source": "usda"}, "serving": {"confidence": 0.95, "grams": 147.0, "label": "1 NLEA serving", "source": "usda"}, "slice": {"confidence": 0.95, "grams": 166.0, "label": "1 cup, sliced", "source": "usda"}, "small": {"confidence": 0.95, "grams": 7.0, "label": "1 small (1\" dia)", "source": "usda"}, "whole": {"confidence": 0.95, "grams": 144.0, "label": "1 cup, whole", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'raw strawberry' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"piece": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'blueberry raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 230.0, "label": "1 cup, pureed", "source": "usda"}, "fruit": {"confidence": 0.95, "grams": 136.0, "label": "1 fruit, without skin and seed", "source": "usda"}, "serving": {"confidence": 0.95, "grams": 50.0, "label": "1 NLEA serving", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'avocado raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"fruit": {"confidence": 0.95, "grams": 336.0, "label": "1 fruit without refuse", "source": "usda"}, "piece": {"confidence": 0.95, "grams": 165.0, "label": "1 cup pieces", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'mango raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 14.0, "label": "1 cup", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'grapes raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 152.0, "label": "1 cup, diced", "source": "usda"}, "serving": {"confidence": 0.95, "grams": 280.0, "label": "1 NLEA serving", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'raw watermelon' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"piece": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'pineapple raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 161.0, "label": "1 cup, cubes", "source": "usda"}, "large": {"confidence": 0.95, "grams": 230.0, "label": "1 large", "source": "usda"}, "medium": {"confidence": 0.95, "grams": 178.0, "label": "1 medium", "source": "usda"}, "serving": {"confidence": 0.95, "grams": 166.0, "label": "1 NLEA serving", "source": "usda"}, "slice": {"confidence": 0.95, "grams": 140.0, "label": "1 cup, slices", "source": "usda"}, "small": {"confidence": 0.95, "grams": 148.0, "label": "1 small", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'pear raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"piece": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'kiwi raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"piece": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'dates dried' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 112.0, "label": "1 cup, shredded", "source": "usda"}, "slice": {"confidence": 0.95, "grams": 170.0, "label": "6 slices", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'milk whole' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 245.0, "label": "1 cup (8 fl oz)", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'milk skim' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.2, "grams": 240, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'milk plain whole yogurt' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'cheddar cheese' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 113.0, "label": "1 cup, shredded", "source": "usda"}, "slice": {"confidence": 0.95, "grams": 28.0, "label": "1 slice", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'cheese mozzarella' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'butter unsalted' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 232.0, "label": "1 cup", "source": "usda"}, "small": {"confidence": 0.95, "grams": 85.0, "label": "1 package, small (3 oz)", "source": "usda"}, "tbsp": {"confidence": 0.95, "grams": 10.0, "label": "1 tbsp, whipped", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'cheese cream' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 100.0, "label": "1 cup", "source": "usda"}, "tbsp": {"confidence": 0.95, "grams": 5.0, "label": "1 tbsp", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'grated parmesan' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"tbsp": {"confidence": 0.95, "grams": 14.0, "label": "1 tablespoon", "source": "usda"}, "tsp": {"confidence": 0.95, "grams": 4.5, "label": "1 teaspoon", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'oil olive' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.2, "grams": 240, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'oil sunflower' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'almonds raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'raw walnuts' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'cashews raw' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"tbsp": {"confidence": 0.95, "grams": 36.0, "label": "2 tablespoon", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'butter peanut smooth' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'chia seeds' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'flaxseeds' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 339.0, "label": "1 cup", "source": "usda"}, "tbsp": {"confidence": 0.95, "grams": 21.0, "label": "1 tbsp", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'honey' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 202.0, "label": "1 cup", "source": "usda"}, "tsp": {"confidence": 0.95, "grams": 4.6, "label": "1 tsp", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'sugar white' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"serving": {"confidence": 0.2, "grams": 100, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = '70 chocolate dark' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 246.0, "label": "1 cup", "source": "usda"}, "tbsp": {"confidence": 0.95, "grams": 15.0, "label": "1 tbsp", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'hummus' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 244.0, "label": "1 cup", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'sauce tomato' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"tbsp": {"confidence": 0.95, "grams": 18.0, "label": "1 tbsp", "source": "usda"}, "tsp": {"confidence": 0.95, "grams": 6.0, "label": "1 tsp", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'sauce soy' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.2, "grams": 240, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'juice orange' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 244.0, "label": "1 cup", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'milk soy' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.95, "grams": 243.0, "label": "1 cup", "source": "usda"}}'::jsonb)
WHERE food_name_normalized = 'black coffee' AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details,'{}'::jsonb) ||
    jsonb_build_object('portions', '{"cup": {"confidence": 0.2, "grams": 240, "label": "estimé", "source": "default"}}'::jsonb)
WHERE food_name_normalized = 'milk oat' AND source = 'usda';
