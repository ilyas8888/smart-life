CREATE TABLE user_ai_entitlements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'FREE',
    plan_name VARCHAR(50) DEFAULT 'Free',
    trial_quota INT NOT NULL DEFAULT 5,
    trial_used INT NOT NULL DEFAULT 0,
    monthly_quota INT DEFAULT 100,
    monthly_used INT NOT NULL DEFAULT 0,
    approved_by BIGINT REFERENCES users(id),
    approved_at TIMESTAMP,
    expires_at TIMESTAMP,
    reset_at TIMESTAMP DEFAULT DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_access_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    message TEXT,
    reviewed_by BIGINT REFERENCES users(id),
    requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMP
);
