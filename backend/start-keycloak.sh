#!/bin/bash
set -e

# Keycloak 24 uses the legacy admin bootstrap variable names. Keep accepting
# the variables configured for newer Keycloak releases in the Space settings.
export KEYCLOAK_ADMIN="${KEYCLOAK_ADMIN:-${KC_BOOTSTRAP_ADMIN_USERNAME:-admin}}"
export KEYCLOAK_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-${KC_BOOTSTRAP_ADMIN_PASSWORD:-admin}}"

# Escape /, & and \ in the secret before using as sed replacement string
ESCAPED=$(printf '%s' "${KEYCLOAK_CLIENT_SECRET:-change-me}" | sed 's/[&/\]/\\&/g')
sed "s/__KC_CLIENT_SECRET__/${ESCAPED}/g" \
    /opt/keycloak/data/import/realm-template.json \
    > /opt/keycloak/data/import/realm-export.json

echo "[Keycloak] Starting on port 8180 with bootstrap admin ${KEYCLOAK_ADMIN}..."

exec /opt/keycloak/bin/kc.sh start --optimized \
    --import-realm \
    --http-enabled=true \
    --http-port=8180 \
    --hostname="${KC_HOSTNAME:-ilyas8888-smartlife-backend.hf.space}" \
    --hostname-strict=false \
    --proxy=edge
