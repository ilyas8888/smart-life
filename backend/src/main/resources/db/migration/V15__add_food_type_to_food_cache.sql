ALTER TABLE food_cache ADD COLUMN IF NOT EXISTS food_type VARCHAR(20) DEFAULT 'SIMPLE_INGREDIENT';
UPDATE food_cache SET food_type = 'PREPARED_DISH' WHERE source = 'ai';
UPDATE food_cache SET food_type = 'SIMPLE_INGREDIENT' WHERE source = 'usda' OR source IS NULL;
