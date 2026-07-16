===== Application Startup at 2026-06-01 09:54:38 =====

2026-06-01 09:54:51,190 CRIT Supervisor is running as root.  Privileges were not dropped because no user is specified in the config file.  If you intend to run as root, you can set user=root in the config file to avoid this message.
2026-06-01 09:54:51,197 INFO supervisord started with pid 1
2026-06-01 09:54:52,202 INFO spawned: 'nginx' with pid 7
2026-06-01 09:54:52,209 INFO spawned: 'keycloak' with pid 8
2026-06-01 09:54:52,224 INFO spawned: 'kc-configure' with pid 9
2026-06-01 09:54:52,232 INFO spawned: 'springboot' with pid 11
[KC-Configure] Waiting for Keycloak realm...
2026-06-01 09:54:52,238 INFO success: keycloak entered RUNNING state, process has stayed up for > than 0 seconds (startsecs)
2026-06-01 09:54:52,240 INFO success: kc-configure entered RUNNING state, process has stayed up for > than 0 seconds (startsecs)
2026-06-01 09:54:52,240 INFO success: springboot entered RUNNING state, process has stayed up for > than 0 seconds (startsecs)
[SpringBoot] Waiting for Keycloak to be ready...
[Keycloak] Starting on port 8180 with bootstrap admin admin...
2026-06-01 09:54:53,250 INFO success: nginx entered RUNNING state, process has stayed up for > than 1 seconds (startsecs)
[SpringBoot] Still waiting... 5s
[SpringBoot] Still waiting... 10s
2026-06-01 09:54:54,720 WARN  [org.keycloak.quarkus.runtime.cli.Picocli] (main) The following build time non-cli options were found, but will be ignored during run time: kc.db

2026-06-01 09:54:54,721 WARN  [org.keycloak.quarkus.runtime.cli.Picocli] (main) The following used options or option values are DEPRECATED and will be removed in a future release:
	- proxy: Use proxy-headers.
Consult the Release Notes for details.
2026-06-01 09:54:56,784 INFO  [org.keycloak.quarkus.runtime.hostname.DefaultHostnameProvider] (main) Hostname settings: Base URL: <unset>, Hostname: ilyas8888-smartlife-backend.hf.space, Strict HTTPS: true, Path: <request>, Strict BackChannel: false, Admin URL: <unset>, Admin: <request>, Port: -1, Proxied: true
2026-06-01 09:54:58,246 INFO  [org.infinispan.CONTAINER] (keycloak-cache-init) ISPN000556: Starting user marshaller 'org.infinispan.jboss.marshalling.core.JBossUserMarshaller'
2026-06-01 09:54:58,915 INFO  [org.infinispan.CLUSTER] (keycloak-cache-init) ISPN000088: Unable to use any JGroups configuration mechanisms provided in properties {}. Using default JGroups configuration!
2026-06-01 09:54:59,375 INFO  [org.infinispan.CLUSTER] (keycloak-cache-init) ISPN000078: Starting JGroups channel `ISPN`
2026-06-01 09:54:59,399 INFO  [org.jgroups.JChannel] (keycloak-cache-init) local_addr: 58228a27-ea2c-4ecf-a1ac-6468197e840f, name: r-ilyas8888-smartlife-backend-6uejhli8-ed4c9-l9s2r-63271
2026-06-01 09:54:59,418 WARN  [org.jgroups.protocols.UDP] (keycloak-cache-init) JGRP000015: the send buffer of socket MulticastSocket was set to 1MB, but the OS only allocated 212.99KB
2026-06-01 09:54:59,418 WARN  [org.jgroups.protocols.UDP] (keycloak-cache-init) JGRP000015: the receive buffer of socket MulticastSocket was set to 20MB, but the OS only allocated 212.99KB
2026-06-01 09:54:59,420 WARN  [org.jgroups.protocols.UDP] (keycloak-cache-init) JGRP000015: the send buffer of socket MulticastSocket was set to 1MB, but the OS only allocated 212.99KB
2026-06-01 09:54:59,420 WARN  [org.jgroups.protocols.UDP] (keycloak-cache-init) JGRP000015: the receive buffer of socket MulticastSocket was set to 25MB, but the OS only allocated 212.99KB
2026-06-01 09:54:59,458 INFO  [org.jgroups.protocols.FD_SOCK2] (keycloak-cache-init) server listening on *.41330
2026-06-01 09:55:01,546 INFO  [org.jgroups.protocols.pbcast.GMS] (keycloak-cache-init) r-ilyas8888-smartlife-backend-6uejhli8-ed4c9-l9s2r-63271: no members discovered after 2070 ms: creating cluster as coordinator
2026-06-01 09:55:01,591 INFO  [org.infinispan.CLUSTER] (keycloak-cache-init) ISPN000094: Received new cluster view for channel ISPN: [r-ilyas8888-smartlife-backend-6uejhli8-ed4c9-l9s2r-63271|0] (1) [r-ilyas8888-smartlife-backend-6uejhli8-ed4c9-l9s2r-63271]
2026-06-01 09:55:01,661 INFO  [org.infinispan.CLUSTER] (keycloak-cache-init) ISPN000079: Channel `ISPN` local address is `r-ilyas8888-smartlife-backend-6uejhli8-ed4c9-l9s2r-63271`, physical addresses are `[<ip-masquee>:56866]`
2026-06-01 09:55:01,697 WARN  [org.infinispan.CONFIG] (keycloak-cache-init) ISPN000569: Unable to persist Infinispan internal caches as no global state enabled
2026-06-01 09:55:04,453 WARN  [io.quarkus.agroal.runtime.DataSources] (JPA Startup Thread) Datasource <default> enables XA but transaction recovery is not enabled. Please enable transaction recovery by setting quarkus.transaction-manager.enable-recovery=true, otherwise data may be lost if the application is terminated abruptly
[SpringBoot] Still waiting... 15s
2026-06-01 09:55:07,519 WARN  [io.quarkus.vertx.http.runtime.VertxHttpRecorder] (main) The X-Forwarded-* and Forwarded headers will be considered when determining the proxy address. This configuration can cause a security issue as clients can forge requests and send a forwarded header that is not overwritten by the proxy. Please consider use one of these headers just to forward the proxy address in requests.
2026-06-01 09:55:08,364 INFO  [org.keycloak.connections.infinispan.DefaultInfinispanConnectionProviderFactory] (main) Node name: r-ilyas8888-smartlife-backend-6uejhli8-ed4c9-l9s2r-63271, Site name: null
2026-06-01 09:55:08,373 INFO  [org.keycloak.broker.provider.AbstractIdentityProviderMapper] (main) Registering class org.keycloak.broker.provider.mappersync.ConfigSyncEventListener
2026-06-01 09:55:10,523 INFO  [org.keycloak.exportimport.singlefile.SingleFileImportProvider] (main) Full importing from file /opt/keycloak/bin/../data/import/realm-template.json
2026-06-01 09:55:11,605 INFO  [org.keycloak.exportimport.util.ImportUtils] (main) Realm 'smartlife' already exists. Import skipped
2026-06-01 09:55:11,618 INFO  [org.keycloak.exportimport.singlefile.SingleFileImportProvider] (main) Full importing from file /opt/keycloak/bin/../data/import/realm-export.json
2026-06-01 09:55:11,622 INFO  [org.keycloak.exportimport.util.ImportUtils] (main) Realm 'smartlife' already exists. Import skipped
2026-06-01 09:55:11,624 INFO  [org.keycloak.exportimport.dir.DirImportProvider] (main) Importing from directory /opt/keycloak/bin/../data/import
2026-06-01 09:55:11,624 INFO  [org.keycloak.services] (main) KC-SERVICES0030: Full model import requested. Strategy: IGNORE_EXISTING
2026-06-01 09:55:11,626 INFO  [org.keycloak.services] (main) KC-SERVICES0032: Import finished successfully
2026-06-01 09:55:12,090 INFO  [io.quarkus] (main) Keycloak 24.0.4 on JVM (powered by Quarkus 3.8.4) started in 19.342s. Listening on: http://0.0.0.0:8180
2026-06-01 09:55:12,101 INFO  [io.quarkus] (main) Profile prod activated. 
2026-06-01 09:55:12,102 INFO  [io.quarkus] (main) Installed features: [agroal, cdi, hibernate-orm, jdbc-postgresql, keycloak, logging-gelf, narayana-jta, reactive-routes, resteasy-reactive, resteasy-reactive-jackson, smallrye-context-propagation, vertx]
[SpringBoot] Still waiting... 20s
[SpringBoot] Starting on port 8080...
Logging into http://localhost:8180 as user admin of realm master

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.5)

2026-06-01T09:55:17.088Z  INFO 11 --- [           main] com.smartlife.SmartlifeApplication       : Starting SmartlifeApplication v0.0.1-SNAPSHOT using Java 17.0.19 with PID 11 (/app/app.jar started by root in /)
2026-06-01T09:55:17.108Z  INFO 11 --- [           main] com.smartlife.SmartlifeApplication       : The following 1 profile is active: "prod"
2026-06-01T09:55:23.567Z  INFO 11 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Multiple Spring Data modules found, entering strict repository configuration mode
2026-06-01T09:55:23.572Z  INFO 11 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JPA repositories in DEFAULT mode.
2026-06-01T09:55:24.202Z  INFO 11 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 609 ms. Found 31 JPA repository interfaces.
2026-06-01T09:55:27.723Z  INFO 11 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port 8080 (http)
2026-06-01T09:55:27.798Z  INFO 11 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2026-06-01T09:55:27.800Z  INFO 11 --- [           main] o.apache.catalina.core.StandardEngine    : Starting Servlet engine: [Apache Tomcat/10.1.55]
2026-06-01T09:55:27.975Z  INFO 11 --- [           main] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2026-06-01T09:55:27.979Z  INFO 11 --- [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 10484 ms
[KC-Configure] Client secret updated (client c298fd92-d44e-40fb-9790-4b3e766a6c15).
2026-06-01 09:55:28,254 INFO exited: kc-configure (exit status 0; expected)
2026-06-01T09:55:29.500Z  INFO 11 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2026-06-01T09:55:30.179Z  INFO 11 --- [           main] com.zaxxer.hikari.pool.HikariPool        : HikariPool-1 - Added connection org.postgresql.jdbc.PgConnection@67d180e4
2026-06-01T09:55:30.182Z  INFO 11 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
2026-06-01T09:55:30.384Z  INFO 11 --- [           main] o.f.c.internal.license.VersionPrinter    : Flyway Community Edition 9.22.3 by Redgate
2026-06-01T09:55:30.385Z  INFO 11 --- [           main] o.f.c.internal.license.VersionPrinter    : See release notes here: https://rd.gt/416ObMi
2026-06-01T09:55:30.386Z  INFO 11 --- [           main] o.f.c.internal.license.VersionPrinter    : 
2026-06-01T09:55:30.480Z  INFO 11 --- [           main] org.flywaydb.core.FlywayExecutor         : Database: jdbc:postgresql://ep-round-dawn-apz8l2ff.c-7.us-east-1.aws.neon.tech/neondb (PostgreSQL 17.10)
2026-06-01T09:55:30.510Z  WARN 11 --- [           main] o.f.c.internal.database.base.Database    : Flyway upgrade recommended: PostgreSQL 17.10 is newer than this version of Flyway and support has not been tested. The latest supported version of PostgreSQL is 15.
2026-06-01T09:55:30.710Z  INFO 11 --- [           main] o.f.core.internal.command.DbMigrate      : Current version of schema "public": 37
2026-06-01T09:55:30.719Z  INFO 11 --- [           main] o.f.core.internal.command.DbMigrate      : Schema "public" is up to date. No migration necessary.
2026-06-01T09:55:31.070Z  INFO 11 --- [           main] o.hibernate.jpa.internal.util.LogHelper  : HHH000204: Processing PersistenceUnitInfo [name: default]
2026-06-01T09:55:31.231Z  INFO 11 --- [           main] org.hibernate.Version                    : HHH000412: Hibernate ORM core version 6.4.4.Final
2026-06-01T09:55:31.351Z  INFO 11 --- [           main] o.h.c.internal.RegionFactoryInitiator    : HHH000026: Second-level cache disabled
2026-06-01T09:55:31.909Z  INFO 11 --- [           main] o.s.o.j.p.SpringPersistenceUnitInfo      : No LoadTimeWeaver setup: ignoring JPA class transformer
2026-06-01T09:55:32.050Z  WARN 11 --- [           main] org.hibernate.orm.deprecation            : HHH90000025: PostgreSQLDialect does not need to be specified explicitly using 'hibernate.dialect' (remove the property setting and it will be selected by default)
2026-06-01T09:55:36.354Z  INFO 11 --- [           main] o.h.e.t.j.p.i.JtaPlatformInitiator       : HHH000489: No JTA platform available (set 'hibernate.transaction.jta.platform' to enable JTA platform integration)
2026-06-01T09:55:36.598Z  INFO 11 --- [           main] j.LocalContainerEntityManagerFactoryBean : Initialized JPA EntityManagerFactory for persistence unit 'default'
2026-06-01T09:55:39.529Z  INFO 11 --- [           main] c.s.service.PushNotificationService      : VAPID push service initialized
2026-06-01T09:55:39.610Z  INFO 11 --- [           main] o.s.d.j.r.query.QueryEnhancerFactory     : Hibernate is in classpath; If applicable, HQL parser will be used.
2026-06-01T09:55:43.822Z  WARN 11 --- [           main] JpaBaseConfiguration$JpaWebConfiguration : spring.jpa.open-in-view is enabled by default. Therefore, database queries may be performed during view rendering. Explicitly configure spring.jpa.open-in-view to disable this warning
2026-06-01T09:55:46.698Z  INFO 11 --- [           main] o.s.b.a.e.web.EndpointLinksResolver      : Exposing 4 endpoint(s) beneath base path '/actuator'
2026-06-01T09:55:49.224Z  INFO 11 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8080 (http) with context path ''
2026-06-01T09:55:49.239Z  INFO 11 --- [           main] o.s.m.s.b.SimpleBrokerMessageHandler     : Starting...
2026-06-01T09:55:49.243Z  INFO 11 --- [           main] o.s.m.s.b.SimpleBrokerMessageHandler     : BrokerAvailabilityEvent[available=true, SimpleBrokerMessageHandler [org.springframework.messaging.simp.broker.DefaultSubscriptionRegistry@4c47eb9b]]
2026-06-01T09:55:49.246Z  INFO 11 --- [           main] o.s.m.s.b.SimpleBrokerMessageHandler     : Started.
2026-06-01T09:55:49.321Z  INFO 11 --- [           main] com.smartlife.SmartlifeApplication       : Started SmartlifeApplication in 34.176 seconds (process running for 36.22)
