CREATE TABLE food_cache (
    id BIGSERIAL PRIMARY KEY,
    food_name VARCHAR(255) NOT NULL,
    food_name_normalized VARCHAR(255) NOT NULL UNIQUE,
    calories NUMERIC(8,2),
    protein_g NUMERIC(6,2),
    carbs_g NUMERIC(6,2),
    fat_g NUMERIC(6,2),
    fiber_g NUMERIC(6,2),
    nutrition_details JSONB,
    hit_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_food_cache_normalized ON food_cache(food_name_normalized);
