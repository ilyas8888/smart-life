CREATE TABLE workout_plans (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT       NOT NULL REFERENCES users(id),
    name          VARCHAR(255) NOT NULL,
    goal          VARCHAR(50)  NOT NULL DEFAULT 'GENERAL',
    weeks         INTEGER      NOT NULL DEFAULT 8,
    days_per_week INTEGER      NOT NULL DEFAULT 3,
    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    start_date    DATE         NOT NULL DEFAULT CURRENT_DATE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE plan_days (
    id         BIGSERIAL PRIMARY KEY,
    plan_id    BIGINT       NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    day_number INTEGER      NOT NULL,
    label      VARCHAR(100) NOT NULL,
    exercises  JSONB        NOT NULL DEFAULT '[]'
);

ALTER TABLE workout_sessions
    ADD COLUMN plan_day_id BIGINT REFERENCES plan_days(id) ON DELETE SET NULL;
