package com.smartlife;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartlifeApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartlifeApplication.class, args);
    }
}
