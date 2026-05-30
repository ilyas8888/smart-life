ALTER TABLE shared_links
    ADD COLUMN IF NOT EXISTS recipient_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS clones_count    INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_shared_links_recipient
    ON shared_links(recipient_email)
    WHERE recipient_email IS NOT NULL;
