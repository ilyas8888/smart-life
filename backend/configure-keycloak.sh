#!/bin/bash
# Runs after Keycloak starts.
# 1. Creates bootstrap admin via welcome page if none exists (KC allows from localhost)
# 2. Forces the client secret from env via kcadm

MAX_WAIT=120
ELAPSED=0
echo "[KC-Configure] Waiting for Keycloak realm..."
until curl -sf "http://localhost:8180/realms/smartlife" > /dev/null 2>&1; do
    if [ "$ELAPSED" -ge "$MAX_WAIT" ]; then
        echo "[KC-Configure] Timeout waiting for Keycloak — aborting"
        exit 1
    fi
    sleep 5
    ELAPSED=$((ELAPSED + 5))
done

ADMIN="${KC_BOOTSTRAP_ADMIN_USERNAME:-admin}"
PASS="${KC_BOOTSTRAP_ADMIN_PASSWORD:-admin}"

# Create admin via welcome page only when no admin exists (localhost only endpoint)
echo "[KC-Configure] Attempting admin creation via welcome page..."
HTTP_CODE=$(curl -s -o /tmp/kc-welcome.log -w "%{http_code}" \
    -X POST "http://localhost:8180/" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=${ADMIN}&password=${PASS}&passwordConfirmation=${PASS}")
echo "[KC-Configure] Welcome page POST: ${HTTP_CODE}"
cat /tmp/kc-welcome.log 2>/dev/null

sleep 5

/opt/keycloak/bin/kcadm.sh config credentials \
    --server http://localhost:8180 \
    --realm master \
    --user "$ADMIN" \
    --password "$PASS" 2>&1

CLIENT_UUID=$(/opt/keycloak/bin/kcadm.sh get clients \
    -r smartlife \
    -q clientId=smartlife-backend \
    --fields id 2>/dev/null | awk -F'"' '/"id"/{print $4}')

if [ -z "$CLIENT_UUID" ]; then
    echo "[KC-Configure] Client smartlife-backend not found — skipping"
    exit 0
fi

/opt/keycloak/bin/kcadm.sh update "clients/${CLIENT_UUID}" \
    -r smartlife \
    -s "secret=${KEYCLOAK_CLIENT_SECRET:-change-me}"

echo "[KC-Configure] Client secret updated (client ${CLIENT_UUID})."
