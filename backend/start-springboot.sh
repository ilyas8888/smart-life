#!/bin/bash

echo "[SpringBoot] Waiting for Keycloak to be ready..."
ELAPSED=0
MAX_WAIT=300

until curl -sf "http://localhost:8180/realms/smartlife" > /dev/null 2>&1; do
    if [ "$ELAPSED" -ge "$MAX_WAIT" ]; then
        echo "[SpringBoot] Keycloak not ready after ${MAX_WAIT}s — starting anyway"
        break
    fi
    sleep 5
    ELAPSED=$((ELAPSED + 5))
    echo "[SpringBoot] Still waiting... ${ELAPSED}s"
done

echo "[SpringBoot] Starting on port 8080..."
exec java -Xms256m -Xmx400m -XX:+UseContainerSupport -jar /app/app.jar
