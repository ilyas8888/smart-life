-- 1. Ajouter la colonne type avec valeur par défaut PRIMARY_NIGHT
ALTER TABLE sleep_logs ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'PRIMARY_NIGHT';

-- 2. Nettoyer les doublons : pour chaque (user_id, sleep_date, type), garder uniquement l'id le plus grand
DELETE FROM sleep_logs
WHERE id NOT IN (
    SELECT MAX(id)
    FROM sleep_logs
    GROUP BY user_id, sleep_date, type
);

-- 3. Ajouter la contrainte unique
ALTER TABLE sleep_logs
    ADD CONSTRAINT uq_sleep_logs_user_date_type UNIQUE (user_id, sleep_date, type);
