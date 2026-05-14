package com.smartlife.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PromptRequest {
    @NotBlank
    private String prompt;
}
