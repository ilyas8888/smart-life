package com.smartlife;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGenTest {
    @Test
    void printHash() {
        System.out.println(new BCryptPasswordEncoder().encode("SmartAdmin2026"));
    }
}
