CREATE TABLE IF NOT EXISTS shared_links (
    id            BIGSERIAL PRIMARY KEY,
    owner_id      BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(30)  NOT NULL,
    resource_id   BIGINT       NOT NULL,
    token         UUID         NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    title         VARCHAR(255),
    permissions   JSONB        NOT NULL DEFAULT '{"allowComments": false, "allowReactions": false}'::jsonb,
    mask_calories BOOLEAN      NOT NULL DEFAULT false,
    expires_at    TIMESTAMP,
    revoked       BOOLEAN      NOT NULL DEFAULT false,
    view_count    INTEGER      NOT NULL DEFAULT 0,
    created_at    TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_links_token ON shared_links(token);
CREATE INDEX IF NOT EXISTS idx_shared_links_owner ON shared_links(owner_id, created_at DESC);
