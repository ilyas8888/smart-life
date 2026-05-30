package com.smartlife.controller;

import com.smartlife.model.SharedLink;
import com.smartlife.repository.SharedLinkRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class SharedLinkIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

    @Autowired
    TestRestTemplate rest;

    @Autowired
    SharedLinkRepository linkRepo;

    @Autowired
    JdbcTemplate jdbc;

    static Long userAId;
    static Long userBId;
    static Long linkId;
    static UUID shareToken;

    @BeforeAll
    void setup() {
        jdbc.execute("TRUNCATE TABLE shared_links, notes, users RESTART IDENTITY CASCADE");

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        userAId = jdbc.queryForObject("""
                INSERT INTO users (email, password, first_name, last_name, provider, email_verified, local_login_allowed)
                VALUES (?, ?, ?, ?, 'LOCAL', true, true)
                RETURNING id
                """, Long.class, "usera@example.com", encoder.encode("Test1234!"), "User", "A");
        userBId = jdbc.queryForObject("""
                INSERT INTO users (email, password, first_name, last_name, provider, email_verified, local_login_allowed)
                VALUES (?, ?, ?, ?, 'LOCAL', true, true)
                RETURNING id
                """, Long.class, "userb@example.com", encoder.encode("Test1234!"), "User", "B");
        jdbc.update("""
                INSERT INTO notes (user_id, title, content, color)
                VALUES (?, ?, ?, ?)
                """, userAId, "Shared test note", "Private note content for sharing", "default");
    }

    @Test
    @Order(1)
    void createLink_asOwner_returns201() {
        String token = getToken("usera@example.com", "Test1234!");

        ResponseEntity<Map> response = rest.exchange(
                "/api/shares",
                HttpMethod.POST,
                authorized(Map.of(
                        "resourceType", "NOTE",
                        "resourceId", 1,
                        "expiresIn", "7D",
                        "allowComments", false,
                        "allowReactions", true,
                        "maskCalories", false
                ), token),
                Map.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("token")).isNotNull();

        linkId = ((Number) response.getBody().get("id")).longValue();
        shareToken = UUID.fromString((String) response.getBody().get("token"));
    }

    @Test
    @Order(2)
    void publicView_validLink_returns200AndIncrementsViewCount() {
        ResponseEntity<Map> response = rest.getForEntity("/api/public/shares/" + shareToken, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        SharedLink link = linkRepo.findByToken(shareToken).orElseThrow();
        assertThat(link.getViewCount()).isEqualTo(1);
    }

    @Test
    @Order(3)
    void publicView_unknownToken_returns404() {
        ResponseEntity<Map> response = rest.getForEntity(
                "/api/public/shares/00000000-0000-0000-0000-000000000000",
                Map.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    @Order(4)
    void nonOwner_cannotRevoke_returns403() {
        String token = getToken("userb@example.com", "Test1234!");

        ResponseEntity<Map> response = rest.exchange(
                "/api/shares/" + linkId + "/revoke",
                HttpMethod.PATCH,
                authorized(null, token),
                Map.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    @Order(5)
    void owner_canRevoke_returns200() {
        String token = getToken("usera@example.com", "Test1234!");

        ResponseEntity<Map> response = rest.exchange(
                "/api/shares/" + linkId + "/revoke",
                HttpMethod.PATCH,
                authorized(null, token),
                Map.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("revoked")).isEqualTo(true);
    }

    @Test
    @Order(6)
    void publicView_revokedLink_returns410() {
        ResponseEntity<Map> response = rest.getForEntity("/api/public/shares/" + shareToken, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.GONE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("error")).isEqualTo("LINK_REVOKED");
    }

    private String getToken(String email, String password) {
        ResponseEntity<Map> response = rest.postForEntity(
                "/api/auth/login",
                Map.of("email", email, "password", password),
                Map.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        Object token = response.getBody().get("accessToken");
        if (token == null) {
            token = response.getBody().get("token");
        }
        assertThat(token).isInstanceOf(String.class);
        return (String) token;
    }

    private HttpEntity<?> authorized(Object body, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(body, headers);
    }
}
