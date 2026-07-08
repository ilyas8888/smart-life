===== Build Queued at 2026-06-18 10:37:47 / Commit SHA: 379fa57 =====

--> FROM docker.io/keycloak/keycloak:24.0.4@sha256:ff02c932f0249c58f32b8ff1b188a48cc90809779a3a05931ab67f5672400ad0
DONE 0.0s

--> FROM docker.io/library/eclipse-temurin:17-jre-jammy@sha256:47c73dc23524b031bed0a5030410c722af6a8b49d4b25898ea8f4615895065f0
DONE 0.0s

--> FROM docker.io/library/maven:3.9.6-eclipse-temurin-17@sha256:29a1658b1f3078e07c2b17f7b519b45eb47f65d9628e887eac45a8c5c8f939d4
DONE 0.0s

--> WORKDIR /app
CACHED

--> COPY pom.xml .
CACHED

--> RUN mvn dependency:go-offline -q
CACHED

--> Restoring cache
DONE 5.1s

--> COPY src ./src
DONE 0.0s

--> RUN mvn package -DskipTests -q
[ERROR] COMPILATION ERROR : 
[ERROR] /app/src/main/java/com/smartlife/config/WebMvcConfig.java:[13,19] cannot find symbol
  symbol:   class IdempotencyInterceptor
  location: class com.smartlife.config.WebMvcConfig
[ERROR] /app/src/main/java/com/smartlife/config/WebMvcConfig.java:[9,1] cannot find symbol
  symbol:   class IdempotencyInterceptor
  location: class com.smartlife.config.WebMvcConfig
[ERROR] Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.11.0:compile (default-compile) on project smartlife-backend: Compilation failure: Compilation failure: 
[ERROR] /app/src/main/java/com/smartlife/config/WebMvcConfig.java:[13,19] cannot find symbol
[ERROR]   symbol:   class IdempotencyInterceptor
[ERROR]   location: class com.smartlife.config.WebMvcConfig
[ERROR] /app/src/main/java/com/smartlife/config/WebMvcConfig.java:[9,1] cannot find symbol
[ERROR]   symbol:   class IdempotencyInterceptor
[ERROR]   location: class com.smartlife.config.WebMvcConfig
[ERROR] -> [Help 1]
[ERROR] 
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR] 
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/MojoFailureException

--> ERROR: process "/bin/sh -c mvn package -DskipTests -q" did not complete successfully: exit code: 1

