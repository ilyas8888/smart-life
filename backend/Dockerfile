# Stage 1: Build Spring Boot JAR
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# Stage 2: Pre-build Keycloak with postgres provider (faster container startup)
FROM quay.io/keycloak/keycloak:24.0.4 AS keycloak-build
RUN /opt/keycloak/bin/kc.sh build --db=postgres

# Stage 3: Runtime — Java + Nginx + Supervisor + Keycloak + Spring Boot
FROM eclipse-temurin:17-jre-jammy

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Keycloak (pre-built with postgres provider)
COPY --from=keycloak-build /opt/keycloak /opt/keycloak

# Spring Boot JAR
COPY --from=builder /app/target/*.jar /app/app.jar

# Config files
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/conf.d/smartlife.conf
COPY start-keycloak.sh /opt/start-keycloak.sh
COPY start-springboot.sh /opt/start-springboot.sh
COPY realm-template.json /opt/keycloak/data/import/realm-template.json

RUN chmod +x /opt/start-keycloak.sh /opt/start-springboot.sh \
    && mkdir -p /var/log/supervisor /run/nginx /opt/keycloak/data/import

EXPOSE 7860

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/smartlife.conf"]
