CREATE TABLE IF NOT EXISTS sleep_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sleep_date  DATE NOT NULL,
    bedtime     TIMESTAMP NOT NULL,
    wake_time   TIMESTAMP NOT NULL,
    quality     SMALLINT NOT NULL CHECK (quality BETWEEN 1 AND 5),
    notes       TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON sleep_logs(user_id, sleep_date DESC);
