CREATE TABLE IF NOT EXISTS user_foods (
  id               BIGSERIAL PRIMARY KEY,
  user_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name             VARCHAR(200) NOT NULL,
  calories         DECIMAL(8,2) NOT NULL,
  protein_g        DECIMAL(8,2),
  carbs_g          DECIMAL(8,2),
  fat_g            DECIMAL(8,2),
  fiber_g          DECIMAL(8,2),
  portions         JSONB,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_foods_user ON user_foods(user_id);
CREATE INDEX IF NOT EXISTS idx_user_foods_name ON user_foods(user_id, lower(name));
