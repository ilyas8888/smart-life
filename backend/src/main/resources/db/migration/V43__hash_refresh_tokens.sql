TRUNCATE TABLE refresh_tokens;

ALTER TABLE refresh_tokens RENAME COLUMN token TO token_hash;

DROP INDEX IF EXISTS idx_refresh_tokens_token_hash;
CREATE UNIQUE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
