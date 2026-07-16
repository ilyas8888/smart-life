-- V44 : répare les alias de V21 qui étaient no-op.
-- Cause : food_name_normalized stocke les mots TRIÉS alphabétiquement (cf. V19),
-- mais V21 utilisait des clés en ordre naturel -> aucune ligne ne correspondait.
-- On ne peut pas modifier V21 (checksum Flyway), donc on réapplique ici les 10
-- alias concernés avec les vraies clés normalisées de V19.
-- Idempotent : jsonb_agg(DISTINCT ...) évite les doublons si rejoué.

-- tomate
UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object('aliases', (
        SELECT jsonb_agg(DISTINCT val)
        FROM jsonb_array_elements_text(
            COALESCE(nutrition_details->'aliases', '[]'::jsonb)
            || '["tomatoes raw", "tomato raw"]'::jsonb) AS val))
WHERE food_name_normalized = 'raw tomato' AND source = 'usda';

-- amandes
UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object('aliases', (
        SELECT jsonb_agg(DISTINCT val)
        FROM jsonb_array_elements_text(
            COALESCE(nutrition_details->'aliases', '[]'::jsonb)
            || '["almond", "almond raw", "almonds"]'::jsonb) AS val))
WHERE food_name_normalized = 'almonds raw' AND source = 'usda';

-- poulet (blanc cuit)
UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object('aliases', (
        SELECT jsonb_agg(DISTINCT val)
        FROM jsonb_array_elements_text(
            COALESCE(nutrition_details->'aliases', '[]'::jsonb)
            || '["chicken breasts cooked", "chicken breast cooked"]'::jsonb) AS val))
WHERE food_name_normalized = 'breast chicken cooked' AND source = 'usda';

-- riz blanc cuit
UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object('aliases', (
        SELECT jsonb_agg(DISTINCT val)
        FROM jsonb_array_elements_text(
            COALESCE(nutrition_details->'aliases', '[]'::jsonb)
            || '["rice cooked", "rice white", "rice white cooked"]'::jsonb) AS val))
WHERE food_name_normalized = 'cooked rice white' AND source = 'usda';

-- myrtilles
UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object('aliases', (
        SELECT jsonb_agg(DISTINCT val)
        FROM jsonb_array_elements_text(
            COALESCE(nutrition_details->'aliases', '[]'::jsonb)
            || '["blueberries raw", "blueberries"]'::jsonb) AS val))
WHERE food_name_normalized = 'blueberry raw' AND source = 'usda';

-- avoine (flocons)
UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object('aliases', (
        SELECT jsonb_agg(DISTINCT val)
        FROM jsonb_array_elements_text(
            COALESCE(nutrition_details->'aliases', '[]'::jsonb)
            || '["oat rolled", "oatmeal", "oats rolled"]'::jsonb) AS val))
WHERE food_name_normalized = 'cooked oats rolled' AND source = 'usda';

-- beurre de cacahuète
UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object('aliases', (
        SELECT jsonb_agg(DISTINCT val)
        FROM jsonb_array_elements_text(
            COALESCE(nutrition_details->'aliases', '[]'::jsonb)
            || '["butter peanut", "peanut butter"]'::jsonb) AS val))
WHERE food_name_normalized = 'butter peanut smooth' AND source = 'usda';

-- cheddar
UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object('aliases', (
        SELECT jsonb_agg(DISTINCT val)
        FROM jsonb_array_elements_text(
            COALESCE(nutrition_details->'aliases', '[]'::jsonb)
            || '["cheese cheddar"]'::jsonb) AS val))
WHERE food_name_normalized = 'cheddar cheese' AND source = 'usda';

-- épinards
UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object('aliases', (
        SELECT jsonb_agg(DISTINCT val)
        FROM jsonb_array_elements_text(
            COALESCE(nutrition_details->'aliases', '[]'::jsonb)
            || '["spinach", "spinach raw"]'::jsonb) AS val))
WHERE food_name_normalized = 'raw spinach' AND source = 'usda';

-- fraises
UPDATE food_cache
SET nutrition_details = COALESCE(nutrition_details, '{}'::jsonb) ||
    jsonb_build_object('aliases', (
        SELECT jsonb_agg(DISTINCT val)
        FROM jsonb_array_elements_text(
            COALESCE(nutrition_details->'aliases', '[]'::jsonb)
            || '["strawberry raw", "strawberries raw"]'::jsonb) AS val))
WHERE food_name_normalized = 'raw strawberry' AND source = 'usda';
