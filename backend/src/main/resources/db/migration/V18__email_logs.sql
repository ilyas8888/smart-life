CREATE TABLE IF NOT EXISTS email_logs (
    id          BIGSERIAL PRIMARY KEY,
    type        VARCHAR(50)  NOT NULL DEFAULT 'GENERAL',
    recipient   VARCHAR(255) NOT NULL,
    status      VARCHAR(20)  NOT NULL,
    error_msg   TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs (created_at DESC);
