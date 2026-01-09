package com.example.todo.controller;

import com.example.todo.dto.*;
import com.example.todo.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest signupRequest) {
        authService.signup(signupRequest);
        return ResponseEntity.ok().body("User registered successfully");
    }

    @PostMapping("/oauth2/callback")
    public ResponseEntity<JwtResponse> oauthCallback(@Valid @RequestBody OAuth2CallbackRequest request) {
        return ResponseEntity.ok(authService.processOAuthPost(request));
    }
}
