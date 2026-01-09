package com.example.todo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OAuth2CallbackRequest {
    @NotBlank
    private String code;

    @NotBlank
    private String provider; // "google", "github"

    private String redirectUri; // Optional, if variable
}
