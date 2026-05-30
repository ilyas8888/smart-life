CREATE TABLE social_posts (
    id              BIGSERIAL PRIMARY KEY,
    author_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type   VARCHAR(30) NOT NULL,
    resource_id     BIGINT NOT NULL,
    title           VARCHAR(255),
    caption         TEXT,
    visibility      VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    reactions_count INTEGER NOT NULL DEFAULT 0,
    comments_count  INTEGER NOT NULL DEFAULT 0,
    saves_count     INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE social_reactions (
    id            BIGSERIAL PRIMARY KEY,
    post_id       BIGINT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('INSPIRED','TRYING','BRAVO','HOW')),
    created_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE (post_id, user_id)
);

CREATE TABLE social_comments (
    id        BIGSERIAL PRIMARY KEY,
    post_id   BIGINT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id BIGINT REFERENCES social_comments(id) ON DELETE CASCADE,
    content   TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE social_saves (
    id         BIGSERIAL PRIMARY KEY,
    post_id    BIGINT NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (post_id, user_id)
);

CREATE INDEX idx_social_posts_created  ON social_posts(created_at DESC);
CREATE INDEX idx_social_posts_type     ON social_posts(resource_type, created_at DESC);
CREATE INDEX idx_social_posts_author   ON social_posts(author_id);
CREATE INDEX idx_social_comments_post  ON social_comments(post_id, created_at ASC);
CREATE INDEX idx_social_reactions_post ON social_reactions(post_id);
CREATE INDEX idx_social_saves_user     ON social_saves(user_id, created_at DESC);
