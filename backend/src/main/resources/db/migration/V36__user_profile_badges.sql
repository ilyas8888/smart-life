-- User profile extensions
ALTER TABLE users ADD COLUMN username     VARCHAR(50)  UNIQUE;
ALTER TABLE users ADD COLUMN bio          TEXT;
ALTER TABLE users ADD COLUMN avatar_color VARCHAR(7)   DEFAULT '#6366F1';

-- Badges earned by users (auto-calculated, persisted for history)
CREATE TABLE user_badges (
    id         BIGSERIAL   PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL,
    earned_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, badge_type)
);
