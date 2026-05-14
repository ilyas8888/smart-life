-- SmartLife Database Schema

CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    first_name  VARCHAR(100),
    last_name   VARCHAR(100),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(500) NOT NULL,
    description TEXT,
    status      VARCHAR(50) NOT NULL DEFAULT 'TODO',  -- TODO, IN_PROGRESS, DONE
    priority    VARCHAR(20) DEFAULT 'MEDIUM',          -- LOW, MEDIUM, HIGH
    due_date    TIMESTAMP,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE reminders (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    remind_at       TIMESTAMP NOT NULL,
    is_recurring    BOOLEAN DEFAULT FALSE,
    recurrence_rule VARCHAR(100),   -- DAILY, WEEKLY, MONTHLY
    is_done         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE diary_entries (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_date  DATE NOT NULL DEFAULT CURRENT_DATE,
    content     TEXT NOT NULL,
    mood        VARCHAR(50),  -- GREAT, GOOD, NEUTRAL, BAD, TERRIBLE
    tags        TEXT[],
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE food_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type   VARCHAR(50),  -- BREAKFAST, LUNCH, DINNER, SNACK
    food_item   VARCHAR(500) NOT NULL,
    calories    INTEGER,
    notes       TEXT,
    logged_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE contacts (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    phone       VARCHAR(50),
    email       VARCHAR(255),
    address     TEXT,
    notes       TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE notes (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(500),
    content     TEXT NOT NULL,
    tags        TEXT[],
    is_pinned   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE prompt_history (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    raw_prompt      TEXT NOT NULL,
    ai_response     JSONB,
    items_created   JSONB,   -- summary of what was created
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_remind_at ON reminders(remind_at);
CREATE INDEX idx_diary_user_date ON diary_entries(user_id, entry_date);
CREATE INDEX idx_food_user_date ON food_logs(user_id, log_date);
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_prompt_history_user_id ON prompt_history(user_id);
