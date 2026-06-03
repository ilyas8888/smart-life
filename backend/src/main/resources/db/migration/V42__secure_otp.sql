-- OTP codes are short-lived (10 min) — safe to truncate and restructure
TRUNCATE TABLE otp_codes;

ALTER TABLE otp_codes RENAME COLUMN code TO code_hash;
ALTER TABLE otp_codes ALTER COLUMN code_hash TYPE VARCHAR(64);
ALTER TABLE otp_codes ADD COLUMN attempts INT NOT NULL DEFAULT 0;
