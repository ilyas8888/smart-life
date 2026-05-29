CREATE TABLE IF NOT EXISTS study_topics (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(120) NOT NULL,
  color         VARCHAR(30) NOT NULL DEFAULT 'blue',
  goal          TEXT,
  target_hours  INTEGER,
  deadline      DATE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_study_topics_user ON study_topics(user_id);

CREATE TABLE IF NOT EXISTS study_sessions (
  id                 BIGSERIAL PRIMARY KEY,
  user_id            BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id           BIGINT REFERENCES study_topics(id) ON DELETE SET NULL,
  title              VARCHAR(200) NOT NULL,
  started_at         TIMESTAMP NOT NULL,
  ended_at           TIMESTAMP,
  duration_minutes   INTEGER,
  focus_score        SMALLINT,
  difficulty_score   SMALLINT,
  notes              TEXT,
  learned            TEXT,
  next_step          TEXT,
  created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_started ON study_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_topic ON study_sessions(topic_id);

CREATE TABLE IF NOT EXISTS study_reviews (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id        BIGINT REFERENCES study_topics(id) ON DELETE CASCADE,
  session_id      BIGINT REFERENCES study_sessions(id) ON DELETE CASCADE,
  review_date     DATE NOT NULL,
  mastery_score   SMALLINT,
  status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  notes           TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_study_reviews_user_date ON study_reviews(user_id, review_date ASC);
