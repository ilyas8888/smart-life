FROM quay.io/keycloak/keycloak:24.0.4
ENV JAVA_OPTS_APPEND="-Xms128m -Xmx220m"
USER root
RUN printf '#!/bin/sh\nexec /opt/keycloak/bin/kc.sh start-dev --db=postgres --http-port=${PORT:-8080}\n' > /start.sh && chmod +x /start.sh
USER keycloak
ENTRYPOINT ["/bin/sh", "/start.sh"]
