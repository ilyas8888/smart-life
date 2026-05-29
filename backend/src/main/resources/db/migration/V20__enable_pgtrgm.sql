-- Enable pg_trgm extension for fuzzy food name search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index on food_name for fast trigram similarity search
CREATE INDEX IF NOT EXISTS idx_food_cache_name_trgm
    ON food_cache USING GIN (food_name gin_trgm_ops);
