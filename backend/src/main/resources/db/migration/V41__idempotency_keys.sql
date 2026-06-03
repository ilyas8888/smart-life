CREATE TABLE idempotency_keys (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    idem_key    VARCHAR(64)  NOT NULL,
    endpoint    VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_idempotency_user_key UNIQUE (user_id, idem_key)
);

CREATE INDEX idx_idempotency_user_key ON idempotency_keys(user_id, idem_key);
