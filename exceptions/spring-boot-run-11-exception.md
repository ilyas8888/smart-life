===== Application Startup at 2026-06-01 09:16:28 =====

2026-06-01 09:16:42,793 CRIT Supervisor is running as root.  Privileges were not dropped because no user is specified in the config file.  If you intend to run as root, you can set user=root in the config file to avoid this message.
2026-06-01 09:16:42,795 INFO supervisord started with pid 1
2026-06-01 09:16:43,798 INFO spawned: 'nginx' with pid 8
2026-06-01 09:16:43,801 INFO spawned: 'keycloak' with pid 9
2026-06-01 09:16:43,804 INFO spawned: 'kc-configure' with pid 10
2026-06-01 09:16:43,832 INFO spawned: 'springboot' with pid 16
[KC-Configure] Waiting for Keycloak realm...
2026-06-01 09:16:43,833 INFO success: keycloak entered RUNNING state, process has stayed up for > than 0 seconds (startsecs)
2026-06-01 09:16:43,833 INFO success: kc-configure entered RUNNING state, process has stayed up for > than 0 seconds (startsecs)
2026-06-01 09:16:43,833 INFO success: springboot entered RUNNING state, process has stayed up for > than 0 seconds (startsecs)
[Keycloak] Starting on port 8180 with bootstrap admin admin...
[SpringBoot] Waiting for Keycloak to be ready...
2026-06-01 09:16:44,875 INFO success: nginx entered RUNNING state, process has stayed up for > than 1 seconds (startsecs)
[SpringBoot] Still waiting... 5s
[SpringBoot] Still waiting... 10s
2026-06-01 09:16:46,482 WARN  [org.keycloak.quarkus.runtime.cli.Picocli] (main) The following build time non-cli options were found, but will be ignored during run time: kc.db

2026-06-01 09:16:46,483 WARN  [org.keycloak.quarkus.runtime.cli.Picocli] (main) The following used options or option values are DEPRECATED and will be removed in a future release:
	- proxy: Use proxy-headers.
Consult the Release Notes for details.
2026-06-01 09:16:48,745 INFO  [org.keycloak.quarkus.runtime.hostname.DefaultHostnameProvider] (main) Hostname settings: Base URL: <unset>, Hostname: ilyas8888-smartlife-backend.hf.space, Strict HTTPS: true, Path: <request>, Strict BackChannel: false, Admin URL: <unset>, Admin: <request>, Port: -1, Proxied: true
2026-06-01 09:16:50,110 INFO  [org.infinispan.CONTAINER] (keycloak-cache-init) ISPN000556: Starting user marshaller 'org.infinispan.jboss.marshalling.core.JBossUserMarshaller'
2026-06-01 09:16:50,976 INFO  [org.infinispan.CLUSTER] (keycloak-cache-init) ISPN000088: Unable to use any JGroups configuration mechanisms provided in properties {}. Using default JGroups configuration!
2026-06-01 09:16:51,432 INFO  [org.infinispan.CLUSTER] (keycloak-cache-init) ISPN000078: Starting JGroups channel `ISPN`
2026-06-01 09:16:51,459 INFO  [org.jgroups.JChannel] (keycloak-cache-init) local_addr: ba3df0c2-5bdd-4169-8338-d43d6d73cf56, name: r-ilyas8888-smartlife-backend-94nt72jg-99b18-plttp-35532
2026-06-01 09:16:51,479 WARN  [org.jgroups.protocols.UDP] (keycloak-cache-init) JGRP000015: the send buffer of socket MulticastSocket was set to 1MB, but the OS only allocated 212.99KB
2026-06-01 09:16:51,479 WARN  [org.jgroups.protocols.UDP] (keycloak-cache-init) JGRP000015: the receive buffer of socket MulticastSocket was set to 20MB, but the OS only allocated 212.99KB
2026-06-01 09:16:51,479 WARN  [org.jgroups.protocols.UDP] (keycloak-cache-init) JGRP000015: the send buffer of socket MulticastSocket was set to 1MB, but the OS only allocated 212.99KB
2026-06-01 09:16:51,479 WARN  [org.jgroups.protocols.UDP] (keycloak-cache-init) JGRP000015: the receive buffer of socket MulticastSocket was set to 25MB, but the OS only allocated 212.99KB
2026-06-01 09:16:51,555 INFO  [org.jgroups.protocols.FD_SOCK2] (keycloak-cache-init) server listening on *.32881
2026-06-01 09:16:53,581 INFO  [org.jgroups.protocols.pbcast.GMS] (keycloak-cache-init) r-ilyas8888-smartlife-backend-94nt72jg-99b18-plttp-35532: no members discovered after 2007 ms: creating cluster as coordinator
2026-06-01 09:16:53,640 INFO  [org.infinispan.CLUSTER] (keycloak-cache-init) ISPN000094: Received new cluster view for channel ISPN: [r-ilyas8888-smartlife-backend-94nt72jg-99b18-plttp-35532|0] (1) [r-ilyas8888-smartlife-backend-94nt72jg-99b18-plttp-35532]
2026-06-01 09:16:53,736 INFO  [org.infinispan.CLUSTER] (keycloak-cache-init) ISPN000079: Channel `ISPN` local address is `r-ilyas8888-smartlife-backend-94nt72jg-99b18-plttp-35532`, physical addresses are `[<ip-masquee>:48417]`
2026-06-01 09:16:53,793 WARN  [org.infinispan.CONFIG] (keycloak-cache-init) ISPN000569: Unable to persist Infinispan internal caches as no global state enabled
2026-06-01 09:16:56,598 WARN  [io.quarkus.agroal.runtime.DataSources] (JPA Startup Thread) Datasource <default> enables XA but transaction recovery is not enabled. Please enable transaction recovery by setting quarkus.transaction-manager.enable-recovery=true, otherwise data may be lost if the application is terminated abruptly
[SpringBoot] Still waiting... 15s
2026-06-01 09:16:59,870 WARN  [io.quarkus.vertx.http.runtime.VertxHttpRecorder] (main) The X-Forwarded-* and Forwarded headers will be considered when determining the proxy address. This configuration can cause a security issue as clients can forge requests and send a forwarded header that is not overwritten by the proxy. Please consider use one of these headers just to forward the proxy address in requests.
2026-06-01 09:17:00,768 INFO  [org.keycloak.connections.infinispan.DefaultInfinispanConnectionProviderFactory] (main) Node name: r-ilyas8888-smartlife-backend-94nt72jg-99b18-plttp-35532, Site name: null
2026-06-01 09:17:00,776 INFO  [org.keycloak.broker.provider.AbstractIdentityProviderMapper] (main) Registering class org.keycloak.broker.provider.mappersync.ConfigSyncEventListener
2026-06-01 09:17:03,172 INFO  [org.keycloak.exportimport.singlefile.SingleFileImportProvider] (main) Full importing from file /opt/keycloak/bin/../data/import/realm-template.json
[SpringBoot] Still waiting... 20s
2026-06-01 09:17:04,575 INFO  [org.keycloak.exportimport.util.ImportUtils] (main) Realm 'smartlife' already exists. Import skipped
2026-06-01 09:17:04,589 INFO  [org.keycloak.exportimport.singlefile.SingleFileImportProvider] (main) Full importing from file /opt/keycloak/bin/../data/import/realm-export.json
2026-06-01 09:17:04,593 INFO  [org.keycloak.exportimport.util.ImportUtils] (main) Realm 'smartlife' already exists. Import skipped
2026-06-01 09:17:04,596 INFO  [org.keycloak.exportimport.dir.DirImportProvider] (main) Importing from directory /opt/keycloak/bin/../data/import
2026-06-01 09:17:04,596 INFO  [org.keycloak.services] (main) KC-SERVICES0030: Full model import requested. Strategy: IGNORE_EXISTING
2026-06-01 09:17:04,598 INFO  [org.keycloak.services] (main) KC-SERVICES0032: Import finished successfully
2026-06-01 09:17:05,173 INFO  [io.quarkus] (main) Keycloak 24.0.4 on JVM (powered by Quarkus 3.8.4) started in 20.743s. Listening on: http://0.0.0.0:8180
2026-06-01 09:17:05,174 INFO  [io.quarkus] (main) Profile prod activated. 
2026-06-01 09:17:05,175 INFO  [io.quarkus] (main) Installed features: [agroal, cdi, hibernate-orm, jdbc-postgresql, keycloak, logging-gelf, narayana-jta, reactive-routes, resteasy-reactive, resteasy-reactive-jackson, smallrye-context-propagation, vertx]
[SpringBoot] Still waiting... 25s
[SpringBoot] Starting on port 8080...
Logging into http://localhost:8180 as user admin of realm master

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.5)

2026-06-01T09:17:17.165Z  INFO 16 --- [           main] com.smartlife.SmartlifeApplication       : Starting SmartlifeApplication v0.0.1-SNAPSHOT using Java 17.0.19 with PID 16 (/app/app.jar started by root in /)
2026-06-01T09:17:17.193Z  INFO 16 --- [           main] com.smartlife.SmartlifeApplication       : The following 1 profile is active: "prod"
2026-06-01T09:17:29.654Z  INFO 16 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Multiple Spring Data modules found, entering strict repository configuration mode
2026-06-01T09:17:29.659Z  INFO 16 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JPA repositories in DEFAULT mode.
2026-06-01T09:17:31.297Z  INFO 16 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 1542 ms. Found 31 JPA repository interfaces.
[KC-Configure] Client secret updated (client c298fd92-d44e-40fb-9790-4b3e766a6c15).
2026-06-01 09:17:33,547 INFO exited: kc-configure (exit status 0; expected)
2026-06-01T09:17:34.816Z  INFO 16 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port 8080 (http)
2026-06-01T09:17:34.851Z  INFO 16 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2026-06-01T09:17:34.851Z  INFO 16 --- [           main] o.apache.catalina.core.StandardEngine    : Starting Servlet engine: [Apache Tomcat/10.1.55]
2026-06-01T09:17:34.953Z  INFO 16 --- [           main] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2026-06-01T09:17:34.957Z  INFO 16 --- [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 17299 ms
2026-06-01T09:17:36.875Z  INFO 16 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2026-06-01T09:17:37.817Z  INFO 16 --- [           main] com.zaxxer.hikari.pool.HikariPool        : HikariPool-1 - Added connection org.postgresql.jdbc.PgConnection@af04f09
2026-06-01T09:17:37.826Z  INFO 16 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
2026-06-01T09:17:38.204Z  INFO 16 --- [           main] o.f.c.internal.license.VersionPrinter    : Flyway Community Edition 9.22.3 by Redgate
2026-06-01T09:17:38.206Z  INFO 16 --- [           main] o.f.c.internal.license.VersionPrinter    : See release notes here: https://rd.gt/416ObMi
2026-06-01T09:17:38.206Z  INFO 16 --- [           main] o.f.c.internal.license.VersionPrinter    : 
2026-06-01T09:17:38.387Z  INFO 16 --- [           main] org.flywaydb.core.FlywayExecutor         : Database: jdbc:postgresql://ep-round-dawn-apz8l2ff.c-7.us-east-1.aws.neon.tech/neondb (PostgreSQL 17.10)
2026-06-01T09:17:38.478Z  WARN 16 --- [           main] o.f.c.internal.database.base.Database    : Flyway upgrade recommended: PostgreSQL 17.10 is newer than this version of Flyway and support has not been tested. The latest supported version of PostgreSQL is 15.
2026-06-01T09:17:38.682Z  INFO 16 --- [           main] o.f.core.internal.command.DbMigrate      : Current version of schema "public": 37
2026-06-01T09:17:38.689Z  INFO 16 --- [           main] o.f.core.internal.command.DbMigrate      : Schema "public" is up to date. No migration necessary.
2026-06-01T09:17:39.114Z  INFO 16 --- [           main] o.hibernate.jpa.internal.util.LogHelper  : HHH000204: Processing PersistenceUnitInfo [name: default]
2026-06-01T09:17:39.294Z  INFO 16 --- [           main] org.hibernate.Version                    : HHH000412: Hibernate ORM core version 6.4.4.Final
2026-06-01T09:17:39.464Z  INFO 16 --- [           main] o.h.c.internal.RegionFactoryInitiator    : HHH000026: Second-level cache disabled
2026-06-01T09:17:40.148Z  INFO 16 --- [           main] o.s.o.j.p.SpringPersistenceUnitInfo      : No LoadTimeWeaver setup: ignoring JPA class transformer
2026-06-01T09:17:40.369Z  WARN 16 --- [           main] org.hibernate.orm.deprecation            : HHH90000025: PostgreSQLDialect does not need to be specified explicitly using 'hibernate.dialect' (remove the property setting and it will be selected by default)
2026-06-01T09:17:45.626Z  INFO 16 --- [           main] o.h.e.t.j.p.i.JtaPlatformInitiator       : HHH000489: No JTA platform available (set 'hibernate.transaction.jta.platform' to enable JTA platform integration)
2026-06-01T09:17:45.952Z  INFO 16 --- [           main] j.LocalContainerEntityManagerFactoryBean : Initialized JPA EntityManagerFactory for persistence unit 'default'
2026-06-01T09:17:49.934Z  INFO 16 --- [           main] c.s.service.PushNotificationService      : VAPID push service initialized
2026-06-01T09:17:50.071Z  INFO 16 --- [           main] o.s.d.j.r.query.QueryEnhancerFactory     : Hibernate is in classpath; If applicable, HQL parser will be used.
2026-06-01T09:17:55.233Z  WARN 16 --- [           main] JpaBaseConfiguration$JpaWebConfiguration : spring.jpa.open-in-view is enabled by default. Therefore, database queries may be performed during view rendering. Explicitly configure spring.jpa.open-in-view to disable this warning
2026-06-01T09:17:58.280Z  INFO 16 --- [           main] o.s.b.a.e.web.EndpointLinksResolver      : Exposing 4 endpoint(s) beneath base path '/actuator'
2026-06-01T09:18:00.980Z  INFO 16 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8080 (http) with context path ''
2026-06-01T09:18:00.985Z  INFO 16 --- [           main] o.s.m.s.b.SimpleBrokerMessageHandler     : Starting...
2026-06-01T09:18:00.986Z  INFO 16 --- [           main] o.s.m.s.b.SimpleBrokerMessageHandler     : BrokerAvailabilityEvent[available=true, SimpleBrokerMessageHandler [org.springframework.messaging.simp.broker.DefaultSubscriptionRegistry@204b128b]]
2026-06-01T09:18:00.988Z  INFO 16 --- [           main] o.s.m.s.b.SimpleBrokerMessageHandler     : Started.
2026-06-01T09:18:01.025Z  INFO 16 --- [           main] com.smartlife.SmartlifeApplication       : Started SmartlifeApplication in 47.837 seconds (process running for 51.183)
2026-06-01T09:18:01.643Z  INFO 16 --- [nio-8080-exec-1] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring DispatcherServlet 'dispatcherServlet'
2026-06-01T09:18:01.644Z  INFO 16 --- [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Initializing Servlet 'dispatcherServlet'
2026-06-01T09:18:01.652Z  INFO 16 --- [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Completed initialization in 7 ms
2026-06-01T09:18:01.845Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:18:07.492Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:18:13.492Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:18:19.828Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:18:25.687Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:18:31.699Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:18:38.188Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:18:45.556Z ERROR 16 --- [nio-8080-exec-9] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:18:52.024Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:19:00.916Z  INFO 16 --- [MessageBroker-2] o.s.w.s.c.WebSocketMessageBrokerStats    : WebSocketSession[0 current WS(0)-HttpStream(0)-HttpPoll(0), 0 total, 0 closed abnormally (0 connect failure, 0 send limit, 0 transport error)], stompSubProtocol[processed CONNECT(0)-CONNECTED(0)-DISCONNECT(0)], stompBrokerRelay[null], inboundChannel[pool size = 0, active threads = 0, queued tasks = 0, completed tasks = 0], outboundChannel[pool size = 0, active threads = 0, queued tasks = 0, completed tasks = 0], sockJsScheduler[pool size = 2, active threads = 1, queued tasks = 1, completed tasks = 1]
2026-06-01T09:19:01.081Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:19:12.342Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:19:24.066Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:19:31.424Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:19:37.888Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:19:46.151Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:19:55.486Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:20:04.888Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:20:14.698Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:20:25.606Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:20:35.382Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:20:43.623Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:20:54.680Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:21:02.256Z  WARN 16 --- [nio-8080-exec-8] o.s.b.actuate.mail.MailHealthIndicator   : Mail health check failed

org.eclipse.angus.mail.util.MailConnectException: Couldn't connect to host, port: smtp-relay.brevo.com, 587; timeout -1
	at org.eclipse.angus.mail.smtp.SMTPTransport.openServer(SMTPTransport.java:2243) ~[jakarta.mail-2.0.3.jar!/:na]
	at org.eclipse.angus.mail.smtp.SMTPTransport.protocolConnect(SMTPTransport.java:729) ~[jakarta.mail-2.0.3.jar!/:na]
	at jakarta.mail.Service.connect(Service.java:345) ~[jakarta.mail-2.0.3.jar!/:na]
	at org.springframework.mail.javamail.JavaMailSenderImpl.connectTransport(JavaMailSenderImpl.java:480) ~[spring-context-support-6.1.6.jar!/:6.1.6]
	at org.springframework.mail.javamail.JavaMailSenderImpl.testConnection(JavaMailSenderImpl.java:360) ~[spring-context-support-6.1.6.jar!/:6.1.6]
	at org.springframework.boot.actuate.mail.MailHealthIndicator.doHealthCheck(MailHealthIndicator.java:52) ~[spring-boot-actuator-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.actuate.health.AbstractHealthIndicator.health(AbstractHealthIndicator.java:82) ~[spring-boot-actuator-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.actuate.health.HealthIndicator.getHealth(HealthIndicator.java:37) ~[spring-boot-actuator-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.actuate.health.HealthEndpointWebExtension.getHealth(HealthEndpointWebExtension.java:94) ~[spring-boot-actuator-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.actuate.health.HealthEndpointWebExtension.getHealth(HealthEndpointWebExtension.java:47) ~[spring-boot-actuator-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.actuate.health.HealthEndpointSupport.getLoggedHealth(HealthEndpointSupport.java:172) ~[spring-boot-actuator-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.actuate.health.HealthEndpointSupport.getContribution(HealthEndpointSupport.java:145) ~[spring-boot-actuator-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.actuate.health.HealthEndpointSupport.getAggregateContribution(HealthEndpointSupport.java:156) ~[spring-boot-actuator-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.actuate.health.HealthEndpointSupport.getContribution(HealthEndpointSupport.java:141) ~[spring-boot-actuator-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.actuate.health.HealthEndpointSupport.getHealth(HealthEndpointSupport.java:110) ~[spring-boot-actuator-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.actuate.health.HealthEndpointSupport.getHealth(HealthEndpointSupport.java:81) ~[spring-boot-actuator-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.actuate.health.HealthEndpointWebExtension.health(HealthEndpointWebExtension.java:80) ~[spring-boot-actuator-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.actuate.health.HealthEndpointWebExtension.health(HealthEndpointWebExtension.java:69) ~[spring-boot-actuator-3.2.5.jar!/:3.2.5]
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method) ~[na:na]
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(Unknown Source) ~[na:na]
	at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(Unknown Source) ~[na:na]
	at java.base/java.lang.reflect.Method.invoke(Unknown Source) ~[na:na]
	at org.springframework.util.ReflectionUtils.invokeMethod(ReflectionUtils.java:281) ~[spring-core-6.1.6.jar!/:6.1.6]
	at org.springframework.boot.actuate.endpoint.invoke.reflect.ReflectiveOperationInvoker.invoke(ReflectiveOperationInvoker.java:74) ~[spring-boot-actuator-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.actuate.endpoint.annotation.AbstractDiscoveredOperation.invoke(AbstractDiscoveredOperation.java:60) ~[spring-boot-actuator-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.actuate.endpoint.web.servlet.AbstractWebMvcEndpointHandlerMapping$ServletWebOperationAdapter.handle(AbstractWebMvcEndpointHandlerMapping.java:327) ~[spring-boot-actuator-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.actuate.endpoint.web.servlet.AbstractWebMvcEndpointHandlerMapping$OperationHandler.handle(AbstractWebMvcEndpointHandlerMapping.java:434) ~[spring-boot-actuator-3.2.5.jar!/:3.2.5]
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method) ~[na:na]
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(Unknown Source) ~[na:na]
	at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(Unknown Source) ~[na:na]
	at java.base/java.lang.reflect.Method.invoke(Unknown Source) ~[na:na]
	at org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:255) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:188) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:118) ~[spring-webmvc-6.1.6.jar!/:6.1.6]
	at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.invokeHandlerMethod(RequestMappingHandlerAdapter.java:926) ~[spring-webmvc-6.1.6.jar!/:6.1.6]
	at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.handleInternal(RequestMappingHandlerAdapter.java:831) ~[spring-webmvc-6.1.6.jar!/:6.1.6]
	at org.springframework.web.servlet.mvc.method.AbstractHandlerMethodAdapter.handle(AbstractHandlerMethodAdapter.java:87) ~[spring-webmvc-6.1.6.jar!/:6.1.6]
	at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089) ~[spring-webmvc-6.1.6.jar!/:6.1.6]
	at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:979) ~[spring-webmvc-6.1.6.jar!/:6.1.6]
	at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014) ~[spring-webmvc-6.1.6.jar!/:6.1.6]
	at org.springframework.web.servlet.FrameworkServlet.doGet(FrameworkServlet.java:903) ~[spring-webmvc-6.1.6.jar!/:6.1.6]
	at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:564) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:885) ~[spring-webmvc-6.1.6.jar!/:6.1.6]
	at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:658) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:193) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:138) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:51) ~[tomcat-embed-websocket-10.1.55.jar!/:na]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:162) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:138) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:110) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:162) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:138) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at io.sentry.spring.jakarta.SentryUserFilter.doFilterInternal(SentryUserFilter.java:56) ~[sentry-spring-jakarta-7.14.0.jar!/:na]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:162) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:138) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:108) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.security.web.FilterChainProxy.lambda$doFilterInternal$3(FilterChainProxy.java:231) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$FilterObservation$SimpleFilterObservation.lambda$wrap$1(ObservationFilterChainDecorator.java:479) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$AroundFilterObservation$SimpleAroundFilterObservation.lambda$wrap$1(ObservationFilterChainDecorator.java:340) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator.lambda$wrapSecured$0(ObservationFilterChainDecorator.java:82) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:128) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.access.intercept.AuthorizationFilter.doFilter(AuthorizationFilter.java:100) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:126) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:120) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:131) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:85) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.authentication.AnonymousAuthenticationFilter.doFilter(AnonymousAuthenticationFilter.java:100) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter.doFilter(SecurityContextHolderAwareRequestFilter.java:179) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.savedrequest.RequestCacheAwareFilter.doFilter(RequestCacheAwareFilter.java:63) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at com.smartlife.security.JwtAuthFilter.doFilterInternal(JwtAuthFilter.java:31) ~[!/:0.0.1-SNAPSHOT]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter.doFilter(AbstractAuthenticationProcessingFilter.java:227) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter.doFilter(AbstractAuthenticationProcessingFilter.java:221) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter.doFilterInternal(OAuth2AuthorizationRequestRedirectFilter.java:181) ~[spring-security-oauth2-client-6.2.4.jar!/:6.2.4]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:107) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:93) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.web.filter.CorsFilter.doFilterInternal(CorsFilter.java:91) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.header.HeaderWriterFilter.doHeadersAfter(HeaderWriterFilter.java:90) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.header.HeaderWriterFilter.doFilterInternal(HeaderWriterFilter.java:75) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:82) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:69) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter.doFilterInternal(WebAsyncManagerIntegrationFilter.java:62) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:227) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.session.DisableEncodeUrlFilter.doFilterInternal(DisableEncodeUrlFilter.java:42) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.wrapFilter(ObservationFilterChainDecorator.java:240) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$AroundFilterObservation$SimpleAroundFilterObservation.lambda$wrap$0(ObservationFilterChainDecorator.java:323) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$ObservationFilter.doFilter(ObservationFilterChainDecorator.java:224) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.ObservationFilterChainDecorator$VirtualFilterChain.doFilter(ObservationFilterChainDecorator.java:137) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.FilterChainProxy.doFilterInternal(FilterChainProxy.java:233) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.security.web.FilterChainProxy.doFilter(FilterChainProxy.java:191) ~[spring-security-web-6.2.4.jar!/:6.2.4]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.web.servlet.handler.HandlerMappingIntrospector.lambda$createCacheFilter$3(HandlerMappingIntrospector.java:195) ~[spring-webmvc-6.1.6.jar!/:6.1.6]
	at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.web.filter.CompositeFilter.doFilter(CompositeFilter.java:74) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.security.config.annotation.web.configuration.WebMvcSecurityConfiguration$CompositeFilterChainProxy.doFilter(WebMvcSecurityConfiguration.java:230) ~[spring-security-config-6.2.4.jar!/:6.2.4]
	at org.springframework.web.filter.DelegatingFilterProxy.invokeDelegate(DelegatingFilterProxy.java:352) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.web.filter.DelegatingFilterProxy.doFilter(DelegatingFilterProxy.java:268) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:162) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:138) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:162) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:138) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:162) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:138) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.springframework.web.filter.ServerHttpObservationFilter.doFilterInternal(ServerHttpObservationFilter.java:109) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:162) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:138) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at io.sentry.spring.jakarta.tracing.SentryTracingFilter.doFilterWithTransaction(SentryTracingFilter.java:107) ~[sentry-spring-jakarta-7.14.0.jar!/:na]
	at io.sentry.spring.jakarta.tracing.SentryTracingFilter.doFilterInternal(SentryTracingFilter.java:87) ~[sentry-spring-jakarta-7.14.0.jar!/:na]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:162) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:138) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:162) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:138) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at io.sentry.spring.jakarta.SentrySpringFilter.doFilterInternal(SentrySpringFilter.java:71) ~[sentry-spring-jakarta-7.14.0.jar!/:na]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:162) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:138) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.springframework.web.filter.ForwardedHeaderFilter.doFilterInternal(ForwardedHeaderFilter.java:173) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.6.jar!/:6.1.6]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:162) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:138) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:165) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:88) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:492) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:113) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:83) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:72) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:342) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:399) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:63) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:1272) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1797) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:973) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:491) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:63) ~[tomcat-embed-core-10.1.55.jar!/:na]
	at java.base/java.lang.Thread.run(Unknown Source) ~[na:na]
Caused by: java.net.ConnectException: Connection timed out
	at java.base/sun.nio.ch.Net.connect0(Native Method) ~[na:na]
	at java.base/sun.nio.ch.Net.connect(Unknown Source) ~[na:na]
	at java.base/sun.nio.ch.Net.connect(Unknown Source) ~[na:na]
	at java.base/sun.nio.ch.NioSocketImpl.connect(Unknown Source) ~[na:na]
	at java.base/java.net.SocksSocketImpl.connect(Unknown Source) ~[na:na]
	at java.base/java.net.Socket.connect(Unknown Source) ~[na:na]
	at java.base/java.net.Socket.connect(Unknown Source) ~[na:na]
	at org.eclipse.angus.mail.util.SocketFetcher.createSocket(SocketFetcher.java:368) ~[jakarta.mail-2.0.3.jar!/:na]
	at org.eclipse.angus.mail.util.SocketFetcher.getSocket(SocketFetcher.java:243) ~[jakarta.mail-2.0.3.jar!/:na]
	at org.eclipse.angus.mail.smtp.SMTPTransport.openServer(SMTPTransport.java:2193) ~[jakarta.mail-2.0.3.jar!/:na]
	... 190 common frames omitted

2026-06-01T09:21:02.282Z  WARN 16 --- [nio-8080-exec-8] o.s.b.a.health.HealthEndpointSupport     : Health contributor org.springframework.boot.actuate.mail.MailHealthIndicator (mail) took 134468ms to respond
2026-06-01T09:21:05.485Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:21:13.394Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:21:21.934Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:21:28.307Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:21:35.465Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:21:45.910Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:21:55.988Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:22:02.962Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:22:11.748Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:22:23.337Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:22:32.450Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:22:42.832Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:22:52.647Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:23:05.503Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:23:15.458Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:23:22.161Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:23:34.575Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:23:41.527Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:23:48.429Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:23:54.738Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:24:00.773Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:24:06.674Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:24:12.519Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:24:18.502Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:24:24.484Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:24:30.537Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:24:36.589Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:24:42.692Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:24:49.013Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:24:55.693Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:25:02.064Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:25:09.618Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:25:19.002Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:25:24.457Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:25:30.445Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:25:36.482Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:25:42.444Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:25:48.452Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:25:54.463Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:26:00.463Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:26:06.479Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:26:12.938Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:26:18.527Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:26:24.497Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:26:30.528Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:26:36.783Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:26:43.068Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:26:50.296Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:26:57.714Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:27:07.759Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:27:18.477Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:27:24.465Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:27:30.470Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:27:36.452Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:27:42.479Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:27:48.486Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:27:54.599Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:28:00.588Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:28:06.535Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:28:12.538Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:28:18.672Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:28:24.546Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:28:30.537Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:28:36.859Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:28:43.215Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:28:51.173Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:28:59.658Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:29:08.259Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:29:16.292Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:29:26.999Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:29:37.058Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:29:47.142Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:29:58.356Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:30:05.931Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:30:16.355Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:30:23.857Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:30:32.716Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:30:42.891Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:30:50.243Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:31:00.173Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:31:10.063Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:31:21.698Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:31:30.787Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:31:40.698Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:31:47.188Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:31:53.533Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:31:59.926Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:32:05.513Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:32:11.476Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:32:17.486Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:32:23.481Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:32:29.619Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:32:35.541Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:32:41.763Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:32:47.776Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:32:54.023Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:33:00.184Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:33:07.857Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:33:15.827Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:33:24.532Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:33:35.318Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:33:45.271Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:33:54.079Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:34:03.766Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:34:13.070Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:34:24.151Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:34:32.277Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:34:41.435Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:34:49.876Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:35:00.315Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:35:09.833Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:35:17.214Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:35:25.287Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:35:32.715Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:35:39.442Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:35:49.806Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:35:57.365Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:36:07.510Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:36:16.216Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:36:25.551Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:36:35.901Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:36:45.576Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:36:52.973Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:37:00.546Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:37:11.296Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:37:21.497Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:37:27.472Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:37:33.463Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:37:39.561Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:37:45.464Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:37:51.455Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:37:57.491Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:38:03.601Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:38:09.478Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:38:15.473Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:38:21.480Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:38:27.504Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:38:33.582Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:38:39.726Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:38:45.631Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:38:52.562Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:39:00.187Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:39:09.087Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:39:19.613Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:39:27.210Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:39:36.499Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:39:46.672Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:39:53.845Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:40:02.271Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:40:11.085Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:40:19.686Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:40:30.007Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:40:38.430Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:40:47.705Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:40:55.688Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:41:02.256Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:41:11.028Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:41:17.777Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:41:25.377Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:41:30.759Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:42:31.570Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:42:36.962Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:42:42.350Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:42:47.733Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:42:53.486Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:42:59.464Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:43:05.470Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:43:11.480Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:43:17.486Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:43:23.476Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:43:29.694Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:43:35.462Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:43:41.501Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:43:47.460Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:44:03.079Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:44:09.479Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:44:15.487Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:44:21.461Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:44:27.474Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:44:33.562Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:44:39.507Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:44:45.486Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:44:51.593Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:44:58.334Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:45:05.072Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:45:12.684Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:45:19.400Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:45:27.819Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:45:33.461Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:45:39.592Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:45:45.469Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:45:51.453Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:45:57.470Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:46:03.449Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:46:09.488Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:46:15.477Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:46:21.467Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:46:27.526Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:46:32.966Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:46:38.468Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:46:44.179Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:46:50.187Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:46:56.567Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:47:04.163Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:47:15.447Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:47:24.771Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:47:34.770Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:47:45.073Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:47:54.527Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:48:04.624Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:48:15.118Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:48:24.892Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:48:35.157Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:48:44.247Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:48:51.963Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:49:00.581Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:49:00.919Z  INFO 16 --- [MessageBroker-1] o.s.w.s.c.WebSocketMessageBrokerStats    : WebSocketSession[0 current WS(0)-HttpStream(0)-HttpPoll(0), 0 total, 0 closed abnormally (0 connect failure, 0 send limit, 0 transport error)], stompSubProtocol[processed CONNECT(0)-CONNECTED(0)-DISCONNECT(0)], stompBrokerRelay[null], inboundChannel[pool size = 0, active threads = 0, queued tasks = 0, completed tasks = 0], outboundChannel[pool size = 0, active threads = 0, queued tasks = 0, completed tasks = 0], sockJsScheduler[pool size = 2, active threads = 1, queued tasks = 1, completed tasks = 32]
2026-06-01T09:49:08.275Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:49:19.373Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:49:28.522Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:49:34.466Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:49:40.473Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:49:46.479Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:49:52.593Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:49:58.468Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:50:04.458Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:50:10.486Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:50:16.487Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:50:22.512Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:50:28.520Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:50:34.541Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:50:40.619Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:50:47.209Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:50:54.019Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:51:00.634Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:51:08.316Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:51:18.723Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:51:28.765Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:51:34.534Z ERROR 16 --- [nio-8080-exec-4] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:51:40.464Z ERROR 16 --- [nio-8080-exec-2] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:51:46.472Z ERROR 16 --- [nio-8080-exec-6] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:51:52.495Z ERROR 16 --- [nio-8080-exec-8] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:51:58.559Z ERROR 16 --- [io-8080-exec-11] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:52:04.506Z ERROR 16 --- [nio-8080-exec-1] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:52:10.489Z ERROR 16 --- [nio-8080-exec-3] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:52:16.480Z ERROR 16 --- [io-8080-exec-10] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:52:22.481Z ERROR 16 --- [nio-8080-exec-5] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
2026-06-01T09:52:28.510Z ERROR 16 --- [nio-8080-exec-7] o.s.w.s.s.s.DefaultHandshakeHandler      : "Handshake failed due to invalid Upgrade header: null"
