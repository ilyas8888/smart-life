===== Application Startup at 2026-05-16 12:24:11 =====


  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.5)

2026-05-16T12:24:20.291Z  INFO 1 --- [           main] com.smartlife.SmartlifeApplication       : Starting SmartlifeApplication v0.0.1-SNAPSHOT using Java 17.0.19 with PID 1 (/app/app.jar started by root in /app)
2026-05-16T12:24:20.300Z  INFO 1 --- [           main] com.smartlife.SmartlifeApplication       : The following 1 profile is active: "prod"
2026-05-16T12:24:22.111Z  INFO 1 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JPA repositories in DEFAULT mode.
2026-05-16T12:24:22.416Z  INFO 1 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 294 ms. Found 13 JPA repository interfaces.
2026-05-16T12:24:23.300Z  INFO 1 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port 7860 (http)
2026-05-16T12:24:23.312Z  INFO 1 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2026-05-16T12:24:23.312Z  INFO 1 --- [           main] o.apache.catalina.core.StandardEngine    : Starting Servlet engine: [Apache Tomcat/10.1.20]
2026-05-16T12:24:23.367Z  INFO 1 --- [           main] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2026-05-16T12:24:23.369Z  INFO 1 --- [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 2887 ms
2026-05-16T12:24:23.497Z  INFO 1 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2026-05-16T12:24:24.005Z  INFO 1 --- [           main] com.zaxxer.hikari.pool.HikariPool        : HikariPool-1 - Added connection org.postgresql.jdbc.PgConnection@40d96578
2026-05-16T12:24:24.008Z  INFO 1 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
2026-05-16T12:24:24.165Z  INFO 1 --- [           main] o.f.c.internal.license.VersionPrinter    : Flyway Community Edition 9.22.3 by Redgate
2026-05-16T12:24:24.165Z  INFO 1 --- [           main] o.f.c.internal.license.VersionPrinter    : See release notes here: https://rd.gt/416ObMi
2026-05-16T12:24:24.165Z  INFO 1 --- [           main] o.f.c.internal.license.VersionPrinter    : 
2026-05-16T12:24:24.194Z  INFO 1 --- [           main] org.flywaydb.core.FlywayExecutor         : Database: jdbc:postgresql://ep-round-dawn-apz8l2ff.c-7.us-east-1.aws.neon.tech/neondb (PostgreSQL 17.8)
2026-05-16T12:24:24.234Z  WARN 1 --- [           main] o.f.c.internal.database.base.Database    : Flyway upgrade recommended: PostgreSQL 17.8 is newer than this version of Flyway and support has not been tested. The latest supported version of PostgreSQL is 15.
2026-05-16T12:24:24.316Z  INFO 1 --- [           main] o.f.core.internal.command.DbValidate     : Successfully validated 8 migrations (execution time 00:00.057s)
2026-05-16T12:24:24.368Z  INFO 1 --- [           main] o.f.core.internal.command.DbMigrate      : Current version of schema "public": 7
2026-05-16T12:24:24.403Z  INFO 1 --- [           main] o.f.core.internal.command.DbMigrate      : Migrating schema "public" to version "8 - add diary entries"
2026-05-16T12:24:24.480Z ERROR 1 --- [           main] o.f.core.internal.command.DbMigrate      : Migration of schema "public" to version "8 - add diary entries" failed! Changes successfully rolled back.
2026-05-16T12:24:24.508Z ERROR 1 --- [           main] o.s.b.web.embedded.tomcat.TomcatStarter  : Error starting Tomcat context. Exception: org.springframework.beans.factory.UnsatisfiedDependencyException. Message: Error creating bean with name 'jwtAuthFilter' defined in URL [jar:nested:/app/app.jar/!BOOT-INF/classes/!/com/smartlife/security/JwtAuthFilter.class]: Unsatisfied dependency expressed through constructor parameter 0: Error creating bean with name 'jwtService' defined in URL [jar:nested:/app/app.jar/!BOOT-INF/classes/!/com/smartlife/security/JwtService.class]: Unsatisfied dependency expressed through constructor parameter 0: Error creating bean with name 'revokedTokenRepository' defined in com.smartlife.repository.RevokedTokenRepository defined in @EnableJpaRepositories declared on JpaRepositoriesRegistrar.EnableJpaRepositoriesConfiguration: Cannot resolve reference to bean 'jpaSharedEM_entityManagerFactory' while setting bean property 'entityManager'
2026-05-16T12:24:24.559Z  INFO 1 --- [           main] o.apache.catalina.core.StandardService   : Stopping service [Tomcat]
2026-05-16T12:24:24.562Z  WARN 1 --- [           main] o.a.c.loader.WebappClassLoaderBase       : The web application [ROOT] appears to have started a thread named [HikariPool-1 housekeeper] but has failed to stop it. This is very likely to create a memory leak. Stack trace of thread:
 java.base@17.0.19/jdk.internal.misc.Unsafe.park(Native Method)
 java.base@17.0.19/java.util.concurrent.locks.LockSupport.parkNanos(Unknown Source)
 java.base@17.0.19/java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(Unknown Source)
 java.base@17.0.19/java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(Unknown Source)
 java.base@17.0.19/java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(Unknown Source)
 java.base@17.0.19/java.util.concurrent.ThreadPoolExecutor.getTask(Unknown Source)
 java.base@17.0.19/java.util.concurrent.ThreadPoolExecutor.runWorker(Unknown Source)
 java.base@17.0.19/java.util.concurrent.ThreadPoolExecutor$Worker.run(Unknown Source)
 java.base@17.0.19/java.lang.Thread.run(Unknown Source)
2026-05-16T12:24:24.563Z  WARN 1 --- [           main] o.a.c.loader.WebappClassLoaderBase       : The web application [ROOT] appears to have started a thread named [HikariPool-1 connection adder] but has failed to stop it. This is very likely to create a memory leak. Stack trace of thread:
 java.base@17.0.19/sun.nio.ch.Net.poll(Native Method)
 java.base@17.0.19/sun.nio.ch.NioSocketImpl.park(Unknown Source)
 java.base@17.0.19/sun.nio.ch.NioSocketImpl.park(Unknown Source)
 java.base@17.0.19/sun.nio.ch.NioSocketImpl.implRead(Unknown Source)
 java.base@17.0.19/sun.nio.ch.NioSocketImpl.read(Unknown Source)
 java.base@17.0.19/sun.nio.ch.NioSocketImpl$1.read(Unknown Source)
 java.base@17.0.19/java.net.Socket$SocketInputStream.read(Unknown Source)
 java.base@17.0.19/sun.security.ssl.SSLSocketInputRecord.read(Unknown Source)
 java.base@17.0.19/sun.security.ssl.SSLSocketInputRecord.readHeader(Unknown Source)
 java.base@17.0.19/sun.security.ssl.SSLSocketInputRecord.bytesInCompletePacket(Unknown Source)
 java.base@17.0.19/sun.security.ssl.SSLSocketImpl.readApplicationRecord(Unknown Source)
 java.base@17.0.19/sun.security.ssl.SSLSocketImpl$AppInputStream.read(Unknown Source)
 org.postgresql.core.VisibleBufferedInputStream.readMore(VisibleBufferedInputStream.java:161)
 org.postgresql.core.VisibleBufferedInputStream.ensureBytes(VisibleBufferedInputStream.java:128)
 org.postgresql.core.VisibleBufferedInputStream.ensureBytes(VisibleBufferedInputStream.java:113)
 org.postgresql.core.VisibleBufferedInputStream.read(VisibleBufferedInputStream.java:73)
 org.postgresql.core.PGStream.receiveChar(PGStream.java:465)
 org.postgresql.core.v3.ConnectionFactoryImpl.doAuthentication(ConnectionFactoryImpl.java:678)
 org.postgresql.core.v3.ConnectionFactoryImpl.tryConnect(ConnectionFactoryImpl.java:203)
 org.postgresql.core.v3.ConnectionFactoryImpl.openConnectionImpl(ConnectionFactoryImpl.java:258)
 org.postgresql.core.ConnectionFactory.openConnection(ConnectionFactory.java:54)
 org.postgresql.jdbc.PgConnection.<init>(PgConnection.java:263)
 org.postgresql.Driver.makeConnection(Driver.java:443)
 org.postgresql.Driver.connect(Driver.java:297)
 com.zaxxer.hikari.util.DriverDataSource.getConnection(DriverDataSource.java:138)
 com.zaxxer.hikari.pool.PoolBase.newConnection(PoolBase.java:359)
 com.zaxxer.hikari.pool.PoolBase.newPoolEntry(PoolBase.java:201)
 com.zaxxer.hikari.pool.HikariPool.createPoolEntry(HikariPool.java:470)
 com.zaxxer.hikari.pool.HikariPool$PoolEntryCreator.call(HikariPool.java:733)
 com.zaxxer.hikari.pool.HikariPool$PoolEntryCreator.call(HikariPool.java:712)
 java.base@17.0.19/java.util.concurrent.FutureTask.run(Unknown Source)
 java.base@17.0.19/java.util.concurrent.ThreadPoolExecutor.runWorker(Unknown Source)
 java.base@17.0.19/java.util.concurrent.ThreadPoolExecutor$Worker.run(Unknown Source)
 java.base@17.0.19/java.lang.Thread.run(Unknown Source)
2026-05-16T12:24:24.567Z  WARN 1 --- [           main] ConfigServletWebServerApplicationContext : Exception encountered during context initialization - cancelling refresh attempt: org.springframework.context.ApplicationContextException: Unable to start web server
2026-05-16T12:24:24.568Z  INFO 1 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2026-05-16T12:24:24.590Z  INFO 1 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
2026-05-16T12:24:24.603Z  INFO 1 --- [           main] .s.b.a.l.ConditionEvaluationReportLogger : 

Error starting ApplicationContext. To display the condition evaluation report re-run your application with 'debug' enabled.
2026-05-16T12:24:24.641Z ERROR 1 --- [           main] o.s.boot.SpringApplication               : Application run failed

org.springframework.context.ApplicationContextException: Unable to start web server
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.onRefresh(ServletWebServerApplicationContext.java:165) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:618) ~[spring-context-6.1.6.jar!/:6.1.6]
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.refresh(ServletWebServerApplicationContext.java:146) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:754) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:456) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:334) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1354) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1343) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at com.smartlife.SmartlifeApplication.main(SmartlifeApplication.java:9) ~[!/:0.0.1-SNAPSHOT]
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method) ~[na:na]
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(Unknown Source) ~[na:na]
	at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(Unknown Source) ~[na:na]
	at java.base/java.lang.reflect.Method.invoke(Unknown Source) ~[na:na]
	at org.springframework.boot.loader.launch.Launcher.launch(Launcher.java:91) ~[app.jar:0.0.1-SNAPSHOT]
	at org.springframework.boot.loader.launch.Launcher.launch(Launcher.java:53) ~[app.jar:0.0.1-SNAPSHOT]
	at org.springframework.boot.loader.launch.JarLauncher.main(JarLauncher.java:58) ~[app.jar:0.0.1-SNAPSHOT]
Caused by: org.springframework.boot.web.server.WebServerException: Unable to start embedded Tomcat
	at org.springframework.boot.web.embedded.tomcat.TomcatWebServer.initialize(TomcatWebServer.java:145) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.web.embedded.tomcat.TomcatWebServer.<init>(TomcatWebServer.java:105) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory.getTomcatWebServer(TomcatServletWebServerFactory.java:499) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory.getWebServer(TomcatServletWebServerFactory.java:218) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.createWebServer(ServletWebServerApplicationContext.java:188) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.onRefresh(ServletWebServerApplicationContext.java:162) ~[spring-boot-3.2.5.jar!/:3.2.5]
	... 15 common frames omitted
Caused by: org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'jwtAuthFilter' defined in URL [jar:nested:/app/app.jar/!BOOT-INF/classes/!/com/smartlife/security/JwtAuthFilter.class]: Unsatisfied dependency expressed through constructor parameter 0: Error creating bean with name 'jwtService' defined in URL [jar:nested:/app/app.jar/!BOOT-INF/classes/!/com/smartlife/security/JwtService.class]: Unsatisfied dependency expressed through constructor parameter 0: Error creating bean with name 'revokedTokenRepository' defined in com.smartlife.repository.RevokedTokenRepository defined in @EnableJpaRepositories declared on JpaRepositoriesRegistrar.EnableJpaRepositoriesConfiguration: Cannot resolve reference to bean 'jpaSharedEM_entityManagerFactory' while setting bean property 'entityManager'
	at org.springframework.beans.factory.support.ConstructorResolver.createArgumentArray(ConstructorResolver.java:795) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.ConstructorResolver.autowireConstructor(ConstructorResolver.java:237) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.autowireConstructor(AbstractAutowireCapableBeanFactory.java:1355) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBeanInstance(AbstractAutowireCapableBeanFactory.java:1192) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:562) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:522) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:326) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:324) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:205) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.boot.web.servlet.ServletContextInitializerBeans.getOrderedBeansOfType(ServletContextInitializerBeans.java:210) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.web.servlet.ServletContextInitializerBeans.addAsRegistrationBean(ServletContextInitializerBeans.java:173) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.web.servlet.ServletContextInitializerBeans.addAsRegistrationBean(ServletContextInitializerBeans.java:168) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.web.servlet.ServletContextInitializerBeans.addAdaptableBeans(ServletContextInitializerBeans.java:153) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.web.servlet.ServletContextInitializerBeans.<init>(ServletContextInitializerBeans.java:86) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.getServletContextInitializerBeans(ServletWebServerApplicationContext.java:266) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.selfInitialize(ServletWebServerApplicationContext.java:240) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.springframework.boot.web.embedded.tomcat.TomcatStarter.onStartup(TomcatStarter.java:52) ~[spring-boot-3.2.5.jar!/:3.2.5]
	at org.apache.catalina.core.StandardContext.startInternal(StandardContext.java:4880) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:171) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at org.apache.catalina.core.ContainerBase$StartChild.call(ContainerBase.java:1332) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at org.apache.catalina.core.ContainerBase$StartChild.call(ContainerBase.java:1322) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at java.base/java.util.concurrent.FutureTask.run(Unknown Source) ~[na:na]
	at org.apache.tomcat.util.threads.InlineExecutorService.execute(InlineExecutorService.java:75) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at java.base/java.util.concurrent.AbstractExecutorService.submit(Unknown Source) ~[na:na]
	at org.apache.catalina.core.ContainerBase.startInternal(ContainerBase.java:866) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at org.apache.catalina.core.StandardHost.startInternal(StandardHost.java:845) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:171) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at org.apache.catalina.core.ContainerBase$StartChild.call(ContainerBase.java:1332) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at org.apache.catalina.core.ContainerBase$StartChild.call(ContainerBase.java:1322) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at java.base/java.util.concurrent.FutureTask.run(Unknown Source) ~[na:na]
	at org.apache.tomcat.util.threads.InlineExecutorService.execute(InlineExecutorService.java:75) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at java.base/java.util.concurrent.AbstractExecutorService.submit(Unknown Source) ~[na:na]
	at org.apache.catalina.core.ContainerBase.startInternal(ContainerBase.java:866) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at org.apache.catalina.core.StandardEngine.startInternal(StandardEngine.java:240) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:171) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at org.apache.catalina.core.StandardService.startInternal(StandardService.java:433) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:171) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at org.apache.catalina.core.StandardServer.startInternal(StandardServer.java:921) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:171) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at org.apache.catalina.startup.Tomcat.start(Tomcat.java:437) ~[tomcat-embed-core-10.1.20.jar!/:na]
	at org.springframework.boot.web.embedded.tomcat.TomcatWebServer.initialize(TomcatWebServer.java:126) ~[spring-boot-3.2.5.jar!/:3.2.5]
	... 20 common frames omitted
Caused by: org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'jwtService' defined in URL [jar:nested:/app/app.jar/!BOOT-INF/classes/!/com/smartlife/security/JwtService.class]: Unsatisfied dependency expressed through constructor parameter 0: Error creating bean with name 'revokedTokenRepository' defined in com.smartlife.repository.RevokedTokenRepository defined in @EnableJpaRepositories declared on JpaRepositoriesRegistrar.EnableJpaRepositoriesConfiguration: Cannot resolve reference to bean 'jpaSharedEM_entityManagerFactory' while setting bean property 'entityManager'
	at org.springframework.beans.factory.support.ConstructorResolver.createArgumentArray(ConstructorResolver.java:795) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.ConstructorResolver.autowireConstructor(ConstructorResolver.java:237) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.autowireConstructor(AbstractAutowireCapableBeanFactory.java:1355) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBeanInstance(AbstractAutowireCapableBeanFactory.java:1192) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:562) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:522) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:326) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:324) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:200) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.config.DependencyDescriptor.resolveCandidate(DependencyDescriptor.java:254) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.doResolveDependency(DefaultListableBeanFactory.java:1443) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveDependency(DefaultListableBeanFactory.java:1353) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.ConstructorResolver.resolveAutowiredArgument(ConstructorResolver.java:904) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.ConstructorResolver.createArgumentArray(ConstructorResolver.java:782) ~[spring-beans-6.1.6.jar!/:6.1.6]
	... 61 common frames omitted
Caused by: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'revokedTokenRepository' defined in com.smartlife.repository.RevokedTokenRepository defined in @EnableJpaRepositories declared on JpaRepositoriesRegistrar.EnableJpaRepositoriesConfiguration: Cannot resolve reference to bean 'jpaSharedEM_entityManagerFactory' while setting bean property 'entityManager'
	at org.springframework.beans.factory.support.BeanDefinitionValueResolver.resolveReference(BeanDefinitionValueResolver.java:377) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.BeanDefinitionValueResolver.resolveValueIfNecessary(BeanDefinitionValueResolver.java:135) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.applyPropertyValues(AbstractAutowireCapableBeanFactory.java:1685) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.populateBean(AbstractAutowireCapableBeanFactory.java:1434) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:599) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:522) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:326) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:324) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:200) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.config.DependencyDescriptor.resolveCandidate(DependencyDescriptor.java:254) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.doResolveDependency(DefaultListableBeanFactory.java:1443) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.DefaultListableBeanFactory.resolveDependency(DefaultListableBeanFactory.java:1353) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.ConstructorResolver.resolveAutowiredArgument(ConstructorResolver.java:904) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.ConstructorResolver.createArgumentArray(ConstructorResolver.java:782) ~[spring-beans-6.1.6.jar!/:6.1.6]
	... 75 common frames omitted
Caused by: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'jpaSharedEM_entityManagerFactory': Cannot resolve reference to bean 'entityManagerFactory' while setting constructor argument
	at org.springframework.beans.factory.support.BeanDefinitionValueResolver.resolveReference(BeanDefinitionValueResolver.java:377) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.BeanDefinitionValueResolver.resolveValueIfNecessary(BeanDefinitionValueResolver.java:135) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.ConstructorResolver.resolveConstructorArguments(ConstructorResolver.java:682) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.ConstructorResolver.instantiateUsingFactoryMethod(ConstructorResolver.java:509) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.instantiateUsingFactoryMethod(AbstractAutowireCapableBeanFactory.java:1335) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBeanInstance(AbstractAutowireCapableBeanFactory.java:1165) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:562) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:522) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:326) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:324) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:200) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.BeanDefinitionValueResolver.resolveReference(BeanDefinitionValueResolver.java:365) ~[spring-beans-6.1.6.jar!/:6.1.6]
	... 89 common frames omitted
Caused by: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'flywayInitializer' defined in class path resource [org/springframework/boot/autoconfigure/flyway/FlywayAutoConfiguration$FlywayConfiguration.class]: Migration V8__add_diary_entries.sql failed
------------------------------------------
SQL State  : 42P07
Error Code : 0
Message    : ERROR: relation "diary_entries" already exists
Location   : db/migration/V8__add_diary_entries.sql (/app/nested:/app/app.jar/!BOOT-INF/classes/!/db/migration/V8__add_diary_entries.sql)
Line       : 1
Statement  : CREATE TABLE diary_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mood VARCHAR(50),
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
)

	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1786) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:600) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:522) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:326) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:234) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:324) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:200) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:313) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:200) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.BeanDefinitionValueResolver.resolveReference(BeanDefinitionValueResolver.java:365) ~[spring-beans-6.1.6.jar!/:6.1.6]
	... 101 common frames omitted
Caused by: org.flywaydb.core.internal.command.DbMigrate$FlywayMigrateException: Migration V8__add_diary_entries.sql failed
------------------------------------------
SQL State  : 42P07
Error Code : 0
Message    : ERROR: relation "diary_entries" already exists
Location   : db/migration/V8__add_diary_entries.sql (/app/nested:/app/app.jar/!BOOT-INF/classes/!/db/migration/V8__add_diary_entries.sql)
Line       : 1
Statement  : CREATE TABLE diary_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mood VARCHAR(50),
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
)

	at org.flywaydb.core.internal.command.DbMigrate.doMigrateGroup(DbMigrate.java:382) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.command.DbMigrate.lambda$applyMigrations$1(DbMigrate.java:272) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.jdbc.TransactionalExecutionTemplate.execute(TransactionalExecutionTemplate.java:55) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.command.DbMigrate.applyMigrations(DbMigrate.java:271) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.command.DbMigrate.migrateGroup(DbMigrate.java:244) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.command.DbMigrate.lambda$migrateAll$0(DbMigrate.java:139) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.database.postgresql.PostgreSQLAdvisoryLockTemplate.execute(PostgreSQLAdvisoryLockTemplate.java:73) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.database.postgresql.PostgreSQLAdvisoryLockTemplate.lambda$execute$0(PostgreSQLAdvisoryLockTemplate.java:56) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.jdbc.TransactionalExecutionTemplate.execute(TransactionalExecutionTemplate.java:55) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.database.postgresql.PostgreSQLAdvisoryLockTemplate.execute(PostgreSQLAdvisoryLockTemplate.java:56) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.database.postgresql.PostgreSQLConnection.lock(PostgreSQLConnection.java:96) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.schemahistory.JdbcTableSchemaHistory.lock(JdbcTableSchemaHistory.java:144) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.command.DbMigrate.migrateAll(DbMigrate.java:139) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.command.DbMigrate.migrate(DbMigrate.java:97) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.Flyway.lambda$migrate$0(Flyway.java:188) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.FlywayExecutor.execute(FlywayExecutor.java:213) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.Flyway.migrate(Flyway.java:140) ~[flyway-core-9.22.3.jar!/:na]
	at org.springframework.boot.autoconfigure.flyway.FlywayMigrationInitializer.afterPropertiesSet(FlywayMigrationInitializer.java:66) ~[spring-boot-autoconfigure-3.2.5.jar!/:3.2.5]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.invokeInitMethods(AbstractAutowireCapableBeanFactory.java:1833) ~[spring-beans-6.1.6.jar!/:6.1.6]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1782) ~[spring-beans-6.1.6.jar!/:6.1.6]
	... 110 common frames omitted
Caused by: org.flywaydb.core.internal.sqlscript.FlywaySqlScriptException: Migration V8__add_diary_entries.sql failed
------------------------------------------
SQL State  : 42P07
Error Code : 0
Message    : ERROR: relation "diary_entries" already exists
Location   : db/migration/V8__add_diary_entries.sql (/app/nested:/app/app.jar/!BOOT-INF/classes/!/db/migration/V8__add_diary_entries.sql)
Line       : 1
Statement  : CREATE TABLE diary_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mood VARCHAR(50),
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
)

	at org.flywaydb.core.internal.sqlscript.DefaultSqlScriptExecutor.handleException(DefaultSqlScriptExecutor.java:267) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.sqlscript.DefaultSqlScriptExecutor.executeStatement(DefaultSqlScriptExecutor.java:222) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.sqlscript.DefaultSqlScriptExecutor.execute(DefaultSqlScriptExecutor.java:126) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.resolver.sql.SqlMigrationExecutor.executeOnce(SqlMigrationExecutor.java:68) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.resolver.sql.SqlMigrationExecutor.lambda$execute$0(SqlMigrationExecutor.java:57) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.database.DefaultExecutionStrategy.execute(DefaultExecutionStrategy.java:27) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.resolver.sql.SqlMigrationExecutor.execute(SqlMigrationExecutor.java:56) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.command.DbMigrate.doMigrateGroup(DbMigrate.java:374) ~[flyway-core-9.22.3.jar!/:na]
	... 129 common frames omitted
Caused by: org.postgresql.util.PSQLException: ERROR: relation "diary_entries" already exists
	at org.postgresql.core.v3.QueryExecutorImpl.receiveErrorResponse(QueryExecutorImpl.java:2713) ~[postgresql-42.6.2.jar!/:42.6.2]
	at org.postgresql.core.v3.QueryExecutorImpl.processResults(QueryExecutorImpl.java:2401) ~[postgresql-42.6.2.jar!/:42.6.2]
	at org.postgresql.core.v3.QueryExecutorImpl.execute(QueryExecutorImpl.java:368) ~[postgresql-42.6.2.jar!/:42.6.2]
	at org.postgresql.jdbc.PgStatement.executeInternal(PgStatement.java:498) ~[postgresql-42.6.2.jar!/:42.6.2]
	at org.postgresql.jdbc.PgStatement.execute(PgStatement.java:415) ~[postgresql-42.6.2.jar!/:42.6.2]
	at org.postgresql.jdbc.PgStatement.executeWithFlags(PgStatement.java:335) ~[postgresql-42.6.2.jar!/:42.6.2]
	at org.postgresql.jdbc.PgStatement.executeCachedSql(PgStatement.java:321) ~[postgresql-42.6.2.jar!/:42.6.2]
	at org.postgresql.jdbc.PgStatement.executeWithFlags(PgStatement.java:297) ~[postgresql-42.6.2.jar!/:42.6.2]
	at org.postgresql.jdbc.PgStatement.execute(PgStatement.java:292) ~[postgresql-42.6.2.jar!/:42.6.2]
	at com.zaxxer.hikari.pool.ProxyStatement.execute(ProxyStatement.java:94) ~[HikariCP-5.0.1.jar!/:na]
	at com.zaxxer.hikari.pool.HikariProxyStatement.execute(HikariProxyStatement.java) ~[HikariCP-5.0.1.jar!/:na]
	at org.flywaydb.core.internal.jdbc.JdbcTemplate.executeStatement(JdbcTemplate.java:201) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.sqlscript.ParsedSqlStatement.execute(ParsedSqlStatement.java:95) ~[flyway-core-9.22.3.jar!/:na]
	at org.flywaydb.core.internal.sqlscript.DefaultSqlScriptExecutor.executeStatement(DefaultSqlScriptExecutor.java:210) ~[flyway-core-9.22.3.jar!/:na]
	... 135 common frames omitted


  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.5)

2026-05-16T12:24:27.997Z  INFO 1 --- [           main] com.smartlife.SmartlifeApplication       : Starting SmartlifeApplication v0.0.1-SNAPSHOT using Java 17.0.19 with PID 1 (/app/app.jar started by root in /app)
2026-05-16T12:24:28.008Z  INFO 1 --- [           main] com.smartlife.SmartlifeApplication       : The following 1 profile is active: "prod"
2026-05-16T12:24:30.004Z  INFO 1 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JPA repositories in DEFAULT mode.
2026-05-16T12:24:30.344Z  INFO 1 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 328 ms. Found 13 JPA repository interfaces.
2026-05-16T12:24:31.222Z  INFO 1 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port 7860 (http)
2026-05-16T12:24:31.280Z  INFO 1 --- [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 3068 ms
2026-05-16T12:24:31.390Z  INFO 1 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2026-05-16T12:24:31.892Z  INFO 1 --- [           main] com.zaxxer.hikari.pool.HikariPool        : HikariPool-1 - Added connection org.postgresql.jdbc.PgConnection@c97721b
2026-05-16T12:24:31.894Z  INFO 1 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
2026-05-16T12:24:32.028Z  INFO 1 --- [           main] o.f.c.internal.license.VersionPrinter    : Flyway Community Edition 9.22.3 by Redgate
2026-05-16T12:24:32.028Z  INFO 1 --- [           main] o.f.c.internal.license.VersionPrinter    : See release notes here: https://rd.gt/416ObMi
2026-05-16T12:24:32.028Z  INFO 1 --- [           main] o.f.c.internal.license.VersionPrinter    : 
2026-05-16T12:24:32.057Z  INFO 1 --- [           main] org.flywaydb.core.FlywayExecutor         : Database: jdbc:postgresql://ep-round-dawn-apz8l2ff.c-7.us-east-1.aws.neon.tech/neondb (PostgreSQL 17.8)
2026-05-16T12:24:32.092Z  WARN 1 --- [           main] o.f.c.internal.database.base.Database    : Flyway upgrade recommended: PostgreSQL 17.8 is newer than this version of Flyway and support has not been tested. The latest supported version of PostgreSQL is 15.
2026-05-16T12:24:32.172Z  INFO 1 --- [           main] o.f.core.internal.command.DbValidate     : Successfully validated 8 migrations (execution time 00:00.064s)
2026-05-16T12:24:32.211Z  INFO 1 --- [           main] o.f.core.internal.command.DbMigrate      : Current version of schema "public": 7
2026-05-16T12:24:32.271Z  INFO 1 --- [           main] o.f.core.internal.command.DbMigrate      : Migrating schema "public" to version "8 - add diary entries"
2026-05-16T12:24:32.300Z ERROR 1 --- [           main] o.f.core.internal.command.DbMigrate      : Migration of schema "public" to version "8 - add diary entries" failed! Changes successfully rolled back.
2026-05-16T12:24:32.318Z ERROR 1 --- [           main] o.s.b.web.embedded.tomcat.TomcatStarter  : Error starting Tomcat context. Exception: org.springframework.beans.factory.UnsatisfiedDependencyException. Message: Error creating bean with name 'jwtAuthFilter' defined in URL [jar:nested:/app/app.jar/!BOOT-INF/classes/!/com/smartlife/security/JwtAuthFilter.class]: Unsatisfied dependency expressed through constructor parameter 0: Error creating bean with name 'jwtService' defined in URL [jar:nested:/app/app.jar/!BOOT-INF/classes/!/com/smartlife/security/JwtService.class]: Unsatisfied dependency expressed through constructor parameter 0: Error creating bean with name 'revokedTokenRepository' defined in com.smartlife.repository.RevokedTokenRepository defined in @EnableJpaRepositories declared on JpaRepositoriesRegistrar.EnableJpaRepositoriesConfiguration: Cannot resolve reference to bean 'jpaSharedEM_entityManagerFactory' while setting bean property 'entityManager'
2026-05-16T12:24:32.361Z  WARN 1 --- [           main] ConfigServletWebServerApplicationContext : Exception encountered during context initialization - cancelling refresh attempt: org.springframework.context.ApplicationContextException: Unable to start web server
2026-05-16T12:24:32.361Z  INFO 1 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown initiated...
2026-05-16T12:24:32.414Z  INFO 1 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Shutdown completed.
