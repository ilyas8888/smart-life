UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["onions raw"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'onion raw'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["apples raw"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'apple raw'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["bananas raw"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'banana raw'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["carrots raw", "carrot"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'carrot raw'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["tomatoes raw"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'tomato raw'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["almond", "almond raw", "almonds raw"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'almonds'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["eggs raw whole", "egg raw", "eggs raw"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'egg raw whole'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["broccolis raw"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'broccoli raw'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["chicken breasts cooked", "breast chicken cooked"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'chicken breast cooked'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["salmon raw", "salmon"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'raw salmon'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["milks whole", "whole milk"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'milk whole'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["rice cooked", "rice white"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'rice white cooked'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["avocados raw"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'avocado raw'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["blueberry raw"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'blueberries raw'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["oat rolled", "oatmeal"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'oats rolled'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["butter peanut"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'peanut butter'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["potatoes raw"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'potato raw'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["cheddar cheese"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'cheese cheddar'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["spinach"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'spinach raw'
  AND source = 'usda';

UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object(
        'aliases',
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM jsonb_array_elements_text(
                COALESCE(nutrition_details->'aliases', '[]'::jsonb) ||
                '["strawberry raw"]'::jsonb
            ) AS val
        )
    )
WHERE food_name_normalized = 'strawberries raw'
  AND source = 'usda';
