
Logs

build
container

Logs Endpoint




Copy
===== Application Startup at 2026-07-04 16:28:27 =====

2026-07-04 16:28:49,644 CRIT Supervisor is running as root.  Privileges were not dropped because no user is specified in the config file.  If you intend to run as root, you can set user=root in the config file to avoid this message.
2026-07-04 16:28:49,649 INFO supervisord started with pid 1
2026-07-04 16:28:50,653 INFO spawned: 'nginx' with pid 7
2026-07-04 16:28:50,656 INFO spawned: 'keycloak' with pid 8
2026-07-04 16:28:50,662 INFO spawned: 'kc-configure' with pid 9
2026-07-04 16:28:50,672 INFO spawned: 'springboot' with pid 13
[KC-Configure] Waiting for Keycloak realm...
2026-07-04 16:28:50,672 INFO success: keycloak entered RUNNING state, process has stayed up for > than 0 seconds (startsecs)
2026-07-04 16:28:50,672 INFO success: kc-configure entered RUNNING state, process has stayed up for > than 0 seconds (startsecs)
2026-07-04 16:28:50,672 INFO success: springboot entered RUNNING state, process has stayed up for > than 0 seconds (startsecs)
[Keycloak] Starting on port 8180 with bootstrap admin admin...
[SpringBoot] Waiting for Keycloak to be ready...
2026-07-04 16:28:51,729 INFO success: nginx entered RUNNING state, process has stayed up for > than 1 seconds (startsecs)
[SpringBoot] Still waiting... 5s
2026-07-04 16:28:53,249 WARN  [org.keycloak.quarkus.runtime.cli.Picocli] (main) The following build time non-cli options were found, but will be ignored during run time: kc.db

2026-07-04 16:28:53,250 WARN  [org.keycloak.quarkus.runtime.cli.Picocli] (main) The following used options or option values are DEPRECATED and will be removed in a future release:
	- proxy: Use proxy-headers.
Consult the Release Notes for details.
2026-07-04 16:28:54,985 INFO  [org.keycloak.quarkus.runtime.hostname.DefaultHostnameProvider] (main) Hostname settings: Base URL: <unset>, Hostname: ilyas8888-smartlife-backend.hf.space, Strict HTTPS: true, Path: <request>, Strict BackChannel: false, Admin URL: <unset>, Admin: <request>, Port: -1, Proxied: true
2026-07-04 16:28:55,861 INFO  [org.infinispan.CONTAINER] (keycloak-cache-init) ISPN000556: Starting user marshaller 'org.infinispan.jboss.marshalling.core.JBossUserMarshaller'
2026-07-04 16:28:56,287 INFO  [org.infinispan.CLUSTER] (keycloak-cache-init) ISPN000088: Unable to use any JGroups configuration mechanisms provided in properties {}. Using default JGroups configuration!
2026-07-04 16:28:56,535 INFO  [org.infinispan.CLUSTER] (keycloak-cache-init) ISPN000078: Starting JGroups channel `ISPN`
2026-07-04 16:28:56,559 INFO  [org.jgroups.JChannel] (keycloak-cache-init) local_addr: 93dacc8b-480c-408f-b10a-a6f817271304, name: r-ilyas8888-smartlife-backend-lgac4536-7bedb-7wk6x-54642
2026-07-04 16:28:56,596 WARN  [org.jgroups.protocols.UDP] (keycloak-cache-init) JGRP000015: the send buffer of socket MulticastSocket was set to 1MB, but the OS only allocated 212.99KB
2026-07-04 16:28:56,596 WARN  [org.jgroups.protocols.UDP] (keycloak-cache-init) JGRP000015: the receive buffer of socket MulticastSocket was set to 20MB, but the OS only allocated 212.99KB
2026-07-04 16:28:56,597 WARN  [org.jgroups.protocols.UDP] (keycloak-cache-init) JGRP000015: the send buffer of socket MulticastSocket was set to 1MB, but the OS only allocated 212.99KB
2026-07-04 16:28:56,597 WARN  [org.jgroups.protocols.UDP] (keycloak-cache-init) JGRP000015: the receive buffer of socket MulticastSocket was set to 25MB, but the OS only allocated 212.99KB
2026-07-04 16:28:56,613 INFO  [org.jgroups.protocols.FD_SOCK2] (keycloak-cache-init) server listening on *.33936
2026-07-04 16:28:58,625 INFO  [org.jgroups.protocols.pbcast.GMS] (keycloak-cache-init) r-ilyas8888-smartlife-backend-lgac4536-7bedb-7wk6x-54642: no members discovered after 2005 ms: creating cluster as coordinator
2026-07-04 16:28:58,651 INFO  [org.infinispan.CLUSTER] (keycloak-cache-init) ISPN000094: Received new cluster view for channel ISPN: [r-ilyas8888-smartlife-backend-lgac4536-7bedb-7wk6x-54642|0] (1) [r-ilyas8888-smartlife-backend-lgac4536-7bedb-7wk6x-54642]
2026-07-04 16:28:58,695 INFO  [org.infinispan.CLUSTER] (keycloak-cache-init) ISPN000079: Channel `ISPN` local address is `r-ilyas8888-smartlife-backend-lgac4536-7bedb-7wk6x-54642`, physical addresses are `[10.111.107.35:49472]`
2026-07-04 16:28:58,726 WARN  [org.infinispan.CONFIG] (keycloak-cache-init) ISPN000569: Unable to persist Infinispan internal caches as no global state enabled
2026-07-04 16:28:59,100 WARN  [io.quarkus.agroal.runtime.DataSources] (JPA Startup Thread) Datasource <default> enables XA but transaction recovery is not enabled. Please enable transaction recovery by setting quarkus.transaction-manager.enable-recovery=true, otherwise data may be lost if the application is terminated abruptly
[SpringBoot] Still waiting... 10s
2026-07-04 16:29:01,917 WARN  [io.quarkus.vertx.http.runtime.VertxHttpRecorder] (main) The X-Forwarded-* and Forwarded headers will be considered when determining the proxy address. This configuration can cause a security issue as clients can forge requests and send a forwarded header that is not overwritten by the proxy. Please consider use one of these headers just to forward the proxy address in requests.
2026-07-04 16:29:02,463 INFO  [org.keycloak.connections.infinispan.DefaultInfinispanConnectionProviderFactory] (main) Node name: r-ilyas8888-smartlife-backend-lgac4536-7bedb-7wk6x-54642, Site name: null
2026-07-04 16:29:02,470 INFO  [org.keycloak.broker.provider.AbstractIdentityProviderMapper] (main) Registering class org.keycloak.broker.provider.mappersync.ConfigSyncEventListener
2026-07-04 16:29:04,146 INFO  [org.keycloak.exportimport.singlefile.SingleFileImportProvider] (main) Full importing from file /opt/keycloak/bin/../data/import/realm-template.json
2026-07-04 16:29:04,739 INFO  [org.keycloak.exportimport.util.ImportUtils] (main) Realm 'smartlife' already exists. Import skipped
2026-07-04 16:29:04,747 INFO  [org.keycloak.exportimport.singlefile.SingleFileImportProvider] (main) Full importing from file /opt/keycloak/bin/../data/import/realm-export.json
2026-07-04 16:29:04,748 INFO  [org.keycloak.exportimport.util.ImportUtils] (main) Realm 'smartlife' already exists. Import skipped
2026-07-04 16:29:04,750 INFO  [org.keycloak.exportimport.dir.DirImportProvider] (main) Importing from directory /opt/keycloak/bin/../data/import
2026-07-04 16:29:04,750 INFO  [org.keycloak.services] (main) KC-SERVICES0030: Full model import requested. Strategy: IGNORE_EXISTING
2026-07-04 16:29:04,750 INFO  [org.keycloak.services] (main) KC-SERVICES0032: Import finished successfully
2026-07-04 16:29:05,315 INFO  [io.quarkus] (main) Keycloak 24.0.4 on JVM (powered by Quarkus 3.8.4) started in 14.154s. Listening on: http://0.0.0.0:8180
2026-07-04 16:29:05,317 INFO  [io.quarkus] (main) Profile prod activated. 
2026-07-04 16:29:05,317 INFO  [io.quarkus] (main) Installed features: [agroal, cdi, hibernate-orm, jdbc-postgresql, keycloak, logging-gelf, narayana-jta, reactive-routes, resteasy-reactive, resteasy-reactive-jackson, smallrye-context-propagation, vertx]
[SpringBoot] Still waiting... 15s
[SpringBoot] Starting on port 8080...
Logging into http://localhost:8180 as user admin of realm master

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.5)

2026-07-04T16:29:10.310Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] com.smartlife.SmartlifeApplication       : Starting SmartlifeApplication v0.0.1-SNAPSHOT using Java 17.0.19 with PID 13 (/app/app.jar started by root in /)
2026-07-04T16:29:10.322Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] com.smartlife.SmartlifeApplication       : The following 1 profile is active: "prod"
2026-07-04T16:29:17.785Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] .s.d.r.c.RepositoryConfigurationDelegate : Multiple Spring Data modules found, entering strict repository configuration mode
2026-07-04T16:29:17.789Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JPA repositories in DEFAULT mode.
2026-07-04T16:29:18.593Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 758 ms. Found 33 JPA repository interfaces.
[KC-Configure] Client secret updated (client c298fd92-d44e-40fb-9790-4b3e766a6c15).
2026-07-04 16:29:19,921 INFO exited: kc-configure (exit status 0; expected)
2026-07-04T16:29:21.576Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port 8080 (http)
2026-07-04T16:29:21.636Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2026-07-04T16:29:21.636Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.apache.catalina.core.StandardEngine    : Starting Servlet engine: [Apache Tomcat/10.1.55]
2026-07-04T16:29:21.722Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2026-07-04T16:29:21.726Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 11030 ms
2026-07-04T16:29:23.661Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2026-07-04T16:29:24.161Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] com.zaxxer.hikari.pool.HikariPool        : HikariPool-1 - Added connection org.postgresql.jdbc.PgConnection@750c23a3
2026-07-04T16:29:24.164Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
2026-07-04T16:29:24.344Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.f.c.internal.license.VersionPrinter    : Flyway Community Edition 9.22.3 by Redgate
2026-07-04T16:29:24.345Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.f.c.internal.license.VersionPrinter    : See release notes here: https://rd.gt/416ObMi
2026-07-04T16:29:24.345Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.f.c.internal.license.VersionPrinter    : 
2026-07-04T16:29:24.375Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] org.flywaydb.core.FlywayExecutor         : Database: jdbc:postgresql://ep-round-dawn-apz8l2ff.c-7.us-east-1.aws.neon.tech/neondb (PostgreSQL 17.10)
2026-07-04T16:29:24.418Z  WARN 13 --- [smartlife-backend] [           main] [                                                 ] o.f.c.internal.database.base.Database    : Flyway upgrade recommended: PostgreSQL 17.10 is newer than this version of Flyway and support has not been tested. The latest supported version of PostgreSQL is 15.
2026-07-04T16:29:24.643Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.f.core.internal.command.DbMigrate      : Current version of schema "public": 44
2026-07-04T16:29:24.650Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.f.core.internal.command.DbMigrate      : Schema "public" is up to date. No migration necessary.
2026-07-04T16:29:24.860Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.hibernate.jpa.internal.util.LogHelper  : HHH000204: Processing PersistenceUnitInfo [name: default]
2026-07-04T16:29:25.059Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] org.hibernate.Version                    : HHH000412: Hibernate ORM core version 6.4.4.Final
2026-07-04T16:29:25.140Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.h.c.internal.RegionFactoryInitiator    : HHH000026: Second-level cache disabled
2026-07-04T16:29:25.736Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.s.o.j.p.SpringPersistenceUnitInfo      : No LoadTimeWeaver setup: ignoring JPA class transformer
2026-07-04T16:29:25.956Z  WARN 13 --- [smartlife-backend] [           main] [                                                 ] org.hibernate.orm.deprecation            : HHH90000025: PostgreSQLDialect does not need to be specified explicitly using 'hibernate.dialect' (remove the property setting and it will be selected by default)
2026-07-04T16:29:29.773Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.h.e.t.j.p.i.JtaPlatformInitiator       : HHH000489: No JTA platform available (set 'hibernate.transaction.jta.platform' to enable JTA platform integration)
2026-07-04T16:29:30.194Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] j.LocalContainerEntityManagerFactoryBean : Initialized JPA EntityManagerFactory for persistence unit 'default'
2026-07-04T16:29:31.541Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.s.d.j.r.query.QueryEnhancerFactory     : Hibernate is in classpath; If applicable, HQL parser will be used.
2026-07-04T16:29:34.927Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] c.s.service.PushNotificationService      : VAPID push service initialized
2026-07-04T16:29:36.647Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] com.smartlife.service.EmbeddingService   : Embeddings Voyage AI activés (recherche par similarité vectorielle disponible)
2026-07-04T16:29:39.085Z  WARN 13 --- [smartlife-backend] [           main] [                                                 ] JpaBaseConfiguration$JpaWebConfiguration : spring.jpa.open-in-view is enabled by default. Therefore, database queries may be performed during view rendering. Explicitly configure spring.jpa.open-in-view to disable this warning
2026-07-04T16:29:40.579Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.s.b.a.e.web.EndpointLinksResolver      : Exposing 3 endpoint(s) beneath base path '/actuator'
2026-07-04T16:29:42.446Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8080 (http) with context path ''
2026-07-04T16:29:42.451Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.s.m.s.b.SimpleBrokerMessageHandler     : Starting...
2026-07-04T16:29:42.452Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.s.m.s.b.SimpleBrokerMessageHandler     : BrokerAvailabilityEvent[available=true, SimpleBrokerMessageHandler [org.springframework.messaging.simp.broker.DefaultSubscriptionRegistry@1706caf5]]
2026-07-04T16:29:42.453Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] o.s.m.s.b.SimpleBrokerMessageHandler     : Started.
2026-07-04T16:29:42.531Z  INFO 13 --- [smartlife-backend] [           main] [                                                 ] com.smartlife.SmartlifeApplication       : Started SmartlifeApplication in 34.275 seconds (process running for 36.222)
2026-07-04T16:29:45.690Z  INFO 13 --- [smartlife-backend] [nio-8080-exec-1] [                                                 ] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring DispatcherServlet 'dispatcherServlet'
2026-07-04T16:29:45.691Z  INFO 13 --- [smartlife-backend] [nio-8080-exec-1] [                                                 ] o.s.web.servlet.DispatcherServlet        : Initializing Servlet 'dispatcherServlet'
2026-07-04T16:29:45.696Z  INFO 13 --- [smartlife-backend] [nio-8080-exec-1] [                                                 ] o.s.web.servlet.DispatcherServlet        : Completed initialization in 4 ms
2026-07-04T16:30:42.287Z  INFO 13 --- [smartlife-backend] [MessageBroker-2] [                                                 ] o.s.w.s.c.WebSocketMessageBrokerStats    : WebSocketSession[0 current WS(0)-HttpStream(0)-HttpPoll(0), 10 total, 0 closed abnormally (0 connect failure, 0 send limit, 0 transport error)], stompSubProtocol[processed CONNECT(10)-CONNECTED(0)-DISCONNECT(0)], stompBrokerRelay[null], inboundChannel[pool size = 4, active threads = 0, queued tasks = 0, completed tasks = 30], outboundChannel[pool size = 4, active threads = 0, queued tasks = 0, completed tasks = 10], sockJsScheduler[pool size = 2, active threads = 1, queued tasks = 1, completed tasks = 1]
