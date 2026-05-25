#!/bin/bash
set -e
# Runs after Keycloak starts and forces the client secret from env via kcadm.
# Keycloak 24 creates the initial admin during startup from KEYCLOAK_ADMIN.

MAX_WAIT=120
ELAPSED=0
echo "[KC-Configure] Waiting for Keycloak realm..."
until curl -sf "http://localhost:8180/realms/smartlife" > /dev/null 2>&1; do
    if [ "$ELAPSED" -ge "$MAX_WAIT" ]; then
        echo "[KC-Configure] Timeout waiting for Keycloak -- aborting"
        exit 1
    fi
    sleep 5
    ELAPSED=$((ELAPSED + 5))
done

ADMIN="${KEYCLOAK_ADMIN:-${KC_BOOTSTRAP_ADMIN_USERNAME:-admin}}"
PASS="${KEYCLOAK_ADMIN_PASSWORD:-${KC_BOOTSTRAP_ADMIN_PASSWORD:-admin}}"

if ! /opt/keycloak/bin/kcadm.sh config credentials \
    --server http://localhost:8180 \
    --realm master \
    --user "$ADMIN" \
    --password "$PASS" 2>&1; then
    echo "[KC-Configure] Admin login failed. Keycloak 24 only bootstraps an admin on an empty master realm."
    exit 1
fi

CLIENT_UUID=$(/opt/keycloak/bin/kcadm.sh get clients \
    -r smartlife \
    -q clientId=smartlife-backend \
    --fields id 2>/dev/null | awk -F'"' '/"id"/{print $4}')

if [ -z "$CLIENT_UUID" ]; then
    echo "[KC-Configure] Client smartlife-backend not found -- aborting"
    exit 1
fi

/opt/keycloak/bin/kcadm.sh update "clients/${CLIENT_UUID}" \
    -r smartlife \
    -s "secret=${KEYCLOAK_CLIENT_SECRET:-change-me}"

echo "[KC-Configure] Client secret updated (client ${CLIENT_UUID})."
