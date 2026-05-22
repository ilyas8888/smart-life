CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE food_cache ADD COLUMN IF NOT EXISTS name_embedding vector(512);
CREATE INDEX IF NOT EXISTS idx_food_cache_embedding
    ON food_cache USING hnsw (name_embedding vector_cosine_ops);
