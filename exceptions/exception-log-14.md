===== Application Startup at 2026-06-01 14:49:54 =====

2026-06-01 14:50:08,232 CRIT Supervisor is running as root.  Privileges were not dropped because no user is specified in the config file.  If you intend to run as root, you can set user=root in the config file to avoid this message.
2026-06-01 14:50:08,234 INFO supervisord started with pid 1
2026-06-01 14:50:09,243 INFO spawned: 'nginx' with pid 7
2026-06-01 14:50:09,246 INFO spawned: 'keycloak' with pid 8
2026-06-01 14:50:09,249 INFO spawned: 'kc-configure' with pid 9
2026-06-01 14:50:09,252 INFO spawned: 'springboot' with pid 10
[KC-Configure] Waiting for Keycloak realm...
2026-06-01 14:50:09,254 INFO success: keycloak entered RUNNING state, process has stayed up for > than 0 seconds (startsecs)
2026-06-01 14:50:09,254 INFO success: kc-configure entered RUNNING state, process has stayed up for > than 0 seconds (startsecs)
2026-06-01 14:50:09,255 INFO success: springboot entered RUNNING state, process has stayed up for > than 0 seconds (startsecs)
[SpringBoot] Waiting for Keycloak to be ready...
[Keycloak] Starting on port 8180 with bootstrap admin admin...
2026-06-01 14:50:10,281 INFO success: nginx entered RUNNING state, process has stayed up for > than 1 seconds (startsecs)
[SpringBoot] Still waiting... 5s
2026-06-01 14:50:10,604 WARN  [org.keycloak.quarkus.runtime.cli.Picocli] (main) The following build time non-cli options were found, but will be ignored during run time: kc.db

2026-06-01 14:50:10,604 WARN  [org.keycloak.quarkus.runtime.cli.Picocli] (main) The following used options or option values are DEPRECATED and will be removed in a future release:
	- proxy: Use proxy-headers.
Consult the Release Notes for details.
2026-06-01 14:50:12,794 INFO  [org.infinispan.CONTAINER] (keycloak-cache-init) ISPN000556: Starting user marshaller 'org.infinispan.jboss.marshalling.core.JBossUserMarshaller'
2026-06-01 14:50:13,182 INFO  [org.infinispan.CLUSTER] (keycloak-cache-init) ISPN000088: Unable to use any JGroups configuration mechanisms provided in properties {}. Using default JGroups configuration!
2026-06-01 14:50:13,447 INFO  [org.keycloak.quarkus.runtime.hostname.DefaultHostnameProvider] (main) Hostname settings: Base URL: <unset>, Hostname: ilyas8888-smartlife-backend.hf.space, Strict HTTPS: true, Path: <request>, Strict BackChannel: false, Admin URL: <unset>, Admin: <request>, Port: -1, Proxied: true
2026-06-01 14:50:13,698 INFO  [org.infinispan.CLUSTER] (keycloak-cache-init) ISPN000078: Starting JGroups channel `ISPN`
2026-06-01 14:50:13,721 INFO  [org.jgroups.JChannel] (keycloak-cache-init) local_addr: 6d575c49-092f-48c7-92b2-9c217316ef60, name: r-ilyas8888-smartlife-backend-3mq3p1ke-4bb02-8nzht-42685
2026-06-01 14:50:13,734 WARN  [org.jgroups.protocols.UDP] (keycloak-cache-init) JGRP000015: the send buffer of socket MulticastSocket was set to 1MB, but the OS only allocated 212.99KB
2026-06-01 14:50:13,735 WARN  [org.jgroups.protocols.UDP] (keycloak-cache-init) JGRP000015: the receive buffer of socket MulticastSocket was set to 20MB, but the OS only allocated 212.99KB
2026-06-01 14:50:13,735 WARN  [org.jgroups.protocols.UDP] (keycloak-cache-init) JGRP000015: the send buffer of socket MulticastSocket was set to 1MB, but the OS only allocated 212.99KB
2026-06-01 14:50:13,735 WARN  [org.jgroups.protocols.UDP] (keycloak-cache-init) JGRP000015: the receive buffer of socket MulticastSocket was set to 25MB, but the OS only allocated 212.99KB
2026-06-01 14:50:13,764 INFO  [org.jgroups.protocols.FD_SOCK2] (keycloak-cache-init) server listening on *.18527
2026-06-01 14:50:15,796 INFO  [org.jgroups.protocols.pbcast.GMS] (keycloak-cache-init) r-ilyas8888-smartlife-backend-3mq3p1ke-4bb02-8nzht-42685: no members discovered after 2016 ms: creating cluster as coordinator
2026-06-01 14:50:15,814 INFO  [org.infinispan.CLUSTER] (keycloak-cache-init) ISPN000094: Received new cluster view for channel ISPN: [r-ilyas8888-smartlife-backend-3mq3p1ke-4bb02-8nzht-42685|0] (1) [r-ilyas8888-smartlife-backend-3mq3p1ke-4bb02-8nzht-42685]
2026-06-01 14:50:15,849 INFO  [org.infinispan.CLUSTER] (keycloak-cache-init) ISPN000079: Channel `ISPN` local address is `r-ilyas8888-smartlife-backend-3mq3p1ke-4bb02-8nzht-42685`, physical addresses are `[10.111.158.143:34063]`
2026-06-01 14:50:15,893 WARN  [org.infinispan.CONFIG] (keycloak-cache-init) ISPN000569: Unable to persist Infinispan internal caches as no global state enabled
2026-06-01 14:50:16,788 WARN  [io.quarkus.agroal.runtime.DataSources] (JPA Startup Thread) Datasource <default> enables XA but transaction recovery is not enabled. Please enable transaction recovery by setting quarkus.transaction-manager.enable-recovery=true, otherwise data may be lost if the application is terminated abruptly
2026-06-01 14:50:18,127 WARN  [io.quarkus.vertx.http.runtime.VertxHttpRecorder] (main) The X-Forwarded-* and Forwarded headers will be considered when determining the proxy address. This configuration can cause a security issue as clients can forge requests and send a forwarded header that is not overwritten by the proxy. Please consider use one of these headers just to forward the proxy address in requests.
2026-06-01 14:50:18,568 INFO  [org.keycloak.connections.infinispan.DefaultInfinispanConnectionProviderFactory] (main) Node name: r-ilyas8888-smartlife-backend-3mq3p1ke-4bb02-8nzht-42685, Site name: null
2026-06-01 14:50:18,573 INFO  [org.keycloak.broker.provider.AbstractIdentityProviderMapper] (main) Registering class org.keycloak.broker.provider.mappersync.ConfigSyncEventListener
[SpringBoot] Still waiting... 10s
2026-06-01 14:50:19,661 INFO  [org.keycloak.exportimport.singlefile.SingleFileImportProvider] (main) Full importing from file /opt/keycloak/bin/../data/import/realm-template.json
2026-06-01 14:50:20,205 INFO  [org.keycloak.exportimport.util.ImportUtils] (main) Realm 'smartlife' already exists. Import skipped
2026-06-01 14:50:20,216 INFO  [org.keycloak.exportimport.singlefile.SingleFileImportProvider] (main) Full importing from file /opt/keycloak/bin/../data/import/realm-export.json
2026-06-01 14:50:20,217 INFO  [org.keycloak.exportimport.util.ImportUtils] (main) Realm 'smartlife' already exists. Import skipped
2026-06-01 14:50:20,218 INFO  [org.keycloak.exportimport.dir.DirImportProvider] (main) Importing from directory /opt/keycloak/bin/../data/import
2026-06-01 14:50:20,219 INFO  [org.keycloak.services] (main) KC-SERVICES0030: Full model import requested. Strategy: IGNORE_EXISTING
2026-06-01 14:50:20,219 INFO  [org.keycloak.services] (main) KC-SERVICES0032: Import finished successfully
2026-06-01 14:50:20,499 INFO  [io.quarkus] (main) Keycloak 24.0.4 on JVM (powered by Quarkus 3.8.4) started in 10.999s. Listening on: http://0.0.0.0:8180
2026-06-01 14:50:20,499 INFO  [io.quarkus] (main) Profile prod activated. 
2026-06-01 14:50:20,500 INFO  [io.quarkus] (main) Installed features: [agroal, cdi, hibernate-orm, jdbc-postgresql, keycloak, logging-gelf, narayana-jta, reactive-routes, resteasy-reactive, resteasy-reactive-jackson, smallrye-context-propagation, vertx]
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

2026-06-01T14:50:28.322Z  INFO 10 --- [           main] com.smartlife.SmartlifeApplication       : Starting SmartlifeApplication v0.0.1-SNAPSHOT using Java 17.0.19 with PID 10 (/app/app.jar started by root in /)
2026-06-01T14:50:28.327Z  INFO 10 --- [           main] com.smartlife.SmartlifeApplication       : The following 1 profile is active: "prod"
2026-06-01T14:50:34.243Z  INFO 10 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Multiple Spring Data modules found, entering strict repository configuration mode
2026-06-01T14:50:34.247Z  INFO 10 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JPA repositories in DEFAULT mode.
2026-06-01T14:50:34.986Z  INFO 10 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 719 ms. Found 31 JPA repository interfaces.
[KC-Configure] Client secret updated (client c298fd92-d44e-40fb-9790-4b3e766a6c15).
2026-06-01 14:50:38,047 INFO exited: kc-configure (exit status 0; expected)
2026-06-01T14:50:38.057Z  INFO 10 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port 8080 (http)
2026-06-01T14:50:38.097Z  INFO 10 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2026-06-01T14:50:38.098Z  INFO 10 --- [           main] o.apache.catalina.core.StandardEngine    : Starting Servlet engine: [Apache Tomcat/10.1.55]
2026-06-01T14:50:38.211Z  INFO 10 --- [           main] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2026-06-01T14:50:38.213Z  INFO 10 --- [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 9653 ms
2026-06-01T14:50:39.435Z  INFO 10 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2026-06-01T14:50:40.016Z  INFO 10 --- [           main] com.zaxxer.hikari.pool.HikariPool        : HikariPool-1 - Added connection org.postgresql.jdbc.PgConnection@78e97d4d
2026-06-01T14:50:40.019Z  INFO 10 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
2026-06-01T14:50:40.250Z  INFO 10 --- [           main] o.f.c.internal.license.VersionPrinter    : Flyway Community Edition 9.22.3 by Redgate
2026-06-01T14:50:40.251Z  INFO 10 --- [           main] o.f.c.internal.license.VersionPrinter    : See release notes here: https://rd.gt/416ObMi
2026-06-01T14:50:40.251Z  INFO 10 --- [           main] o.f.c.internal.license.VersionPrinter    : 
2026-06-01T14:50:40.290Z  INFO 10 --- [           main] org.flywaydb.core.FlywayExecutor         : Database: jdbc:postgresql://ep-round-dawn-apz8l2ff.c-7.us-east-1.aws.neon.tech/neondb (PostgreSQL 17.10)
2026-06-01T14:50:40.327Z  WARN 10 --- [           main] o.f.c.internal.database.base.Database    : Flyway upgrade recommended: PostgreSQL 17.10 is newer than this version of Flyway and support has not been tested. The latest supported version of PostgreSQL is 15.
2026-06-01T14:50:40.587Z  INFO 10 --- [           main] o.f.core.internal.command.DbMigrate      : Current version of schema "public": 37
2026-06-01T14:50:40.600Z  INFO 10 --- [           main] o.f.core.internal.command.DbMigrate      : Schema "public" is up to date. No migration necessary.
2026-06-01T14:50:40.842Z  INFO 10 --- [           main] o.hibernate.jpa.internal.util.LogHelper  : HHH000204: Processing PersistenceUnitInfo [name: default]
2026-06-01T14:50:41.040Z  INFO 10 --- [           main] org.hibernate.Version                    : HHH000412: Hibernate ORM core version 6.4.4.Final
2026-06-01T14:50:41.134Z  INFO 10 --- [           main] o.h.c.internal.RegionFactoryInitiator    : HHH000026: Second-level cache disabled
2026-06-01T14:50:41.749Z  INFO 10 --- [           main] o.s.o.j.p.SpringPersistenceUnitInfo      : No LoadTimeWeaver setup: ignoring JPA class transformer
2026-06-01T14:50:41.922Z  WARN 10 --- [           main] org.hibernate.orm.deprecation            : HHH90000025: PostgreSQLDialect does not need to be specified explicitly using 'hibernate.dialect' (remove the property setting and it will be selected by default)
2026-06-01T14:50:46.470Z  INFO 10 --- [           main] o.h.e.t.j.p.i.JtaPlatformInitiator       : HHH000489: No JTA platform available (set 'hibernate.transaction.jta.platform' to enable JTA platform integration)
2026-06-01T14:50:46.702Z  INFO 10 --- [           main] j.LocalContainerEntityManagerFactoryBean : Initialized JPA EntityManagerFactory for persistence unit 'default'
2026-06-01T14:50:49.514Z  INFO 10 --- [           main] c.s.service.PushNotificationService      : VAPID push service initialized
2026-06-01T14:50:49.555Z  INFO 10 --- [           main] o.s.d.j.r.query.QueryEnhancerFactory     : Hibernate is in classpath; If applicable, HQL parser will be used.
2026-06-01T14:50:52.951Z  WARN 10 --- [           main] JpaBaseConfiguration$JpaWebConfiguration : spring.jpa.open-in-view is enabled by default. Therefore, database queries may be performed during view rendering. Explicitly configure spring.jpa.open-in-view to disable this warning
2026-06-01T14:50:55.153Z  INFO 10 --- [           main] o.s.b.a.e.web.EndpointLinksResolver      : Exposing 4 endpoint(s) beneath base path '/actuator'
2026-06-01T14:50:57.006Z  INFO 10 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8080 (http) with context path ''
2026-06-01T14:50:57.015Z  INFO 10 --- [           main] o.s.m.s.b.SimpleBrokerMessageHandler     : Starting...
2026-06-01T14:50:57.018Z  INFO 10 --- [           main] o.s.m.s.b.SimpleBrokerMessageHandler     : BrokerAvailabilityEvent[available=true, SimpleBrokerMessageHandler [org.springframework.messaging.simp.broker.DefaultSubscriptionRegistry@2bdf341a]]
2026-06-01T14:50:57.019Z  INFO 10 --- [           main] o.s.m.s.b.SimpleBrokerMessageHandler     : Started.
2026-06-01T14:50:57.057Z  INFO 10 --- [           main] com.smartlife.SmartlifeApplication       : Started SmartlifeApplication in 30.46 seconds (process running for 32.246)
2026-06-01T14:50:57.831Z  INFO 10 --- [nio-8080-exec-1] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring DispatcherServlet 'dispatcherServlet'
2026-06-01T14:50:57.832Z  INFO 10 --- [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Initializing Servlet 'dispatcherServlet'
2026-06-01T14:50:57.840Z  INFO 10 --- [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Completed initialization in 6 ms
2026-06-01T14:50:58.056Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:51:03.524Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:51:07.252Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:51:10.955Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:51:16.366Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:51:21.792Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:51:27.200Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:51:32.621Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:51:38.041Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:51:43.497Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:51:48.990Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:51:54.531Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:51:56.857Z  INFO 10 --- [MessageBroker-2] o.s.w.s.c.WebSocketMessageBrokerStats    : WebSocketSession[0 current WS(0)-HttpStream(0)-HttpPoll(0), 0 total, 0 closed abnormally (0 connect failure, 0 send limit, 0 transport error)], stompSubProtocol[processed CONNECT(0)-CONNECTED(0)-DISCONNECT(0)], stompBrokerRelay[null], inboundChannel[pool size = 0, active threads = 0, queued tasks = 0, completed tasks = 0], outboundChannel[pool size = 0, active threads = 0, queued tasks = 0, completed tasks = 0], sockJsScheduler[pool size = 2, active threads = 1, queued tasks = 1, completed tasks = 1]
2026-06-01T14:52:00.630Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:52:06.857Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:52:14.251Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:52:23.939Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:52:33.415Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:52:41.185Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:52:52.291Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:53:01.453Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:53:11.027Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:53:18.043Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:53:25.530Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:53:34.985Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:53:41.955Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:53:50.665Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:54:01.601Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:54:12.479Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:54:22.931Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:54:32.097Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:54:38.657Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:54:49.149Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:54:56.288Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:55:03.950Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:55:14.343Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:55:24.824Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:55:34.237Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:55:42.697Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:55:51.683Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:56:01.495Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:56:12.318Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:56:21.669Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:56:30.157Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:56:37.593Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:56:48.661Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:56:56.544Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:57:05.450Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:57:13.305Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:57:24.082Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:57:33.686Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:57:42.220Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:57:53.332Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:58:01.897Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:58:10.999Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:58:19.458Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:58:29.204Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:58:37.257Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:58:47.705Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:58:53.537Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:58:59.528Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:59:05.529Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:59:11.529Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:59:17.519Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:59:23.696Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:59:29.540Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:59:35.556Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:59:41.964Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:59:47.546Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T14:59:53.556Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:00:00.601Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:00:06.761Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:00:12.914Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:00:19.499Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:00:28.057Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:00:35.822Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:00:43.393Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:00:49.532Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:00:55.537Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:01:01.532Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:01:07.546Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:01:13.551Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:01:19.516Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:01:25.544Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:01:32.521Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:01:38.549Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:01:44.791Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:01:50.576Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:01:57.472Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:02:04.541Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:02:10.735Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:02:17.274Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:02:24.758Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:02:35.321Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:02:46.452Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:02:52.533Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:02:58.534Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:03:04.522Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:03:10.544Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:03:16.536Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:03:22.560Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:03:28.563Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:03:34.543Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:03:40.664Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:03:46.566Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:03:55.475Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:04:03.303Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:04:13.719Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:04:20.581Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:04:27.952Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:04:35.415Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:04:44.873Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:04:53.296Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:05:02.647Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:05:10.507Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:05:21.655Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:05:29.788Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:05:40.760Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:05:48.933Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:05:59.585Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:06:08.691Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:06:15.670Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:06:24.616Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:06:33.427Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:06:42.645Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:06:51.991Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:06:57.541Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:07:03.545Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:07:11.595Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:07:22.037Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:07:31.531Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:07:37.533Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:07:44.478Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:07:50.550Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:07:58.811Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:08:05.428Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:08:11.182Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:08:17.272Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:08:23.678Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:08:36.461Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:08:44.236Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:08:54.394Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:09:07.918Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:09:15.059Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:09:27.825Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:09:38.350Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:09:47.917Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:09:57.839Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:10:06.020Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:10:14.449Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:10:24.162Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:10:31.667Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:10:40.340Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:10:50.936Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:10:56.564Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:11:03.063Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:11:08.563Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:11:14.657Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:11:21.265Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:11:27.571Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:11:34.028Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:11:39.557Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:11:45.785Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:11:51.692Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:11:58.076Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:12:03.621Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:12:12.363Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:12:20.916Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:12:27.566Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:12:34.130Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:12:44.099Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:12:52.906Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:12:58.540Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:13:04.583Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:13:10.546Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:13:16.563Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:13:22.816Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:13:31.046Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:13:36.565Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:13:42.555Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:13:48.791Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:13:54.558Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:14:03.752Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:14:10.639Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:14:19.114Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:14:26.231Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:14:33.138Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:14:36.614Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:14:46.547Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:14:55.137Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:15:00.519Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:15:05.916Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:15:11.316Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:15:16.694Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:15:22.103Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:15:27.633Z ERROR 10 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:15:33.054Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:15:38.453Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:15:43.870Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:15:49.323Z ERROR 10 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:15:54.799Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:16:02.022Z ERROR 10 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:16:09.729Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:16:15.937Z ERROR 10 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:16:23.856Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:16:32.497Z ERROR 10 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:16:35.361Z ERROR 10 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:16:47.404Z ERROR 10 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:16:54.550Z ERROR 10 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:17:03.781Z ERROR 10 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T15:17:10.543Z ERROR 10 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
