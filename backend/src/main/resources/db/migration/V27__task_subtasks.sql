ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date TIMESTAMP;

CREATE TABLE IF NOT EXISTS task_checklists (
  id          BIGSERIAL PRIMARY KEY,
  task_id     BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  text        VARCHAR(300) NOT NULL,
  done        BOOLEAN NOT NULL DEFAULT false,
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_task_checklists_task ON task_checklists(task_id);
