package com.smartlife.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.net.URI;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Configuration
public class CacheConfig {

    // ── Redis connection factory — only when URL is non-empty ────────────────
    @Bean
    @ConditionalOnExpression("!'${spring.data.redis.url:}'.isEmpty()")
    public RedisConnectionFactory redisConnectionFactory(
            @Value("${spring.data.redis.url}") String redisUrl) {
        URI uri = URI.create(redisUrl);
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName(uri.getHost());
        config.setPort(uri.getPort() > 0 ? uri.getPort() : 6379);
        if (uri.getUserInfo() != null) {
            String[] parts = uri.getUserInfo().split(":", 2);
            if (parts.length == 2) config.setPassword(parts[1]);
        }
        boolean ssl = "rediss".equals(uri.getScheme());
        LettuceClientConfiguration clientConfig = ssl
                ? LettuceClientConfiguration.builder().useSsl().build()
                : LettuceClientConfiguration.builder().build();
        LettuceConnectionFactory factory = new LettuceConnectionFactory(config, clientConfig);
        factory.afterPropertiesSet();
        return factory;
    }

    // ── Redis CacheManager (TTL per cache name) ───────────────────────────────
    @Bean
    @ConditionalOnBean(RedisConnectionFactory.class)
    public CacheManager redisCacheManager(RedisConnectionFactory cf) {
        ObjectMapper om = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        RedisCacheConfiguration base = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer(om)))
                .disableCachingNullValues()
                .entryTtl(Duration.ofMinutes(5));

        return RedisCacheManager.builder(cf)
                .cacheDefaults(base)
                .withInitialCacheConfigurations(Map.of(
                        "day-score-today",   base.entryTtl(Duration.ofMinutes(5)),
                        "day-score-history", base.entryTtl(Duration.ofHours(12)),
                        "profile",           base.entryTtl(Duration.ofMinutes(2)),
                        "social-feed",       base.entryTtl(Duration.ofSeconds(30)),
                        "food-catalog",      base.entryTtl(Duration.ofMinutes(30))
                ))
                .build();
    }

    // ── Caffeine fallback (local dev or when Redis not configured) ────────────
    @Bean
    @ConditionalOnMissingBean(CacheManager.class)
    public CacheManager caffeineCacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager(
                "day-score-today", "day-score-history", "profile", "social-feed", "food-catalog");
        manager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .maximumSize(500));
        return manager;
    }
}
