package com.example.todo.service;

import com.example.todo.dto.*;
import com.example.todo.entity.OAuthCredential;
import com.example.todo.entity.User;
import com.example.todo.repository.UserRepository;
import com.example.todo.security.JwtTokenProvider;
import com.example.todo.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RestTemplate restTemplate;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String githubClientId;

    @Value("${spring.security.oauth2.client.registration.github.client-secret}")
    private String githubClientSecret;

    // In production, keep these dynamic or from property
    private static final String GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_USER_INFO_URI = "https://www.googleapis.com/oauth2/v3/userinfo";
    private static final String GITHUB_TOKEN_URI = "https://github.com/login/oauth/access_token";
    private static final String GITHUB_USER_INFO_URI = "https://api.github.com/user";

    public JwtResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getIdentifier(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateToken(authentication);

        UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();
        return new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(), userDetails.getEmail(),
                userDetails.getAuthorities().stream().map(Object::toString).toList());
    }

    public void signup(SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(signupRequest.getPassword()));

        userRepository.save(user);
    }

    @Transactional
    public JwtResponse processOAuthPost(OAuth2CallbackRequest request) {
        String token = exchangeCodeForToken(request);
        Map<String, Object> userInfo = fetchUserInfo(request.getProvider(), token);

        String email = (String) userInfo.get("email");
        String name = (String) (userInfo.containsKey("name") ? userInfo.get("name") : userInfo.get("login"));
        String providerId = request.getProvider().equalsIgnoreCase("google") ? (String) userInfo.get("sub")
                : String.valueOf(userInfo.get("id"));

        if (email == null)
            throw new RuntimeException("Email not found from provider");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setUsername(email);
            userRepository.save(user);
        }

        // Link credential if not exists
        boolean credentialExists = user.getCredentials().stream()
                .anyMatch(c -> c.getProvider().equalsIgnoreCase(request.getProvider())
                        && c.getProviderId().equals(providerId));

        if (!credentialExists) {
            OAuthCredential cred = new OAuthCredential();
            cred.setProvider(request.getProvider());
            cred.setProviderId(providerId);
            cred.setEmail(email);
            cred.setName(name);
            cred.setUser(user);
            user.getCredentials().add(cred);
            userRepository.save(user);
        }

        String jwt = jwtTokenProvider.generateTokenFromUsername(user.getUsername());
        return new JwtResponse(jwt, user.getId(), user.getUsername(), user.getEmail(),
                Collections.singletonList("ROLE_USER"));
    }

    private String exchangeCodeForToken(OAuth2CallbackRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("code", request.getCode());
        map.add("redirect_uri",
                request.getRedirectUri() != null ? request.getRedirectUri() : "http://localhost:3000/callback");
        map.add("grant_type", "authorization_code");

        String tokenUri = "";
        if ("google".equalsIgnoreCase(request.getProvider())) {
            map.add("client_id", googleClientId);
            map.add("client_secret", googleClientSecret);
            tokenUri = GOOGLE_TOKEN_URI;
        } else if ("github".equalsIgnoreCase(request.getProvider())) {
            map.add("client_id", githubClientId);
            map.add("client_secret", githubClientSecret);
            tokenUri = GITHUB_TOKEN_URI;
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        } else {
            throw new RuntimeException("Unsupported provider");
        }

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(map, headers);
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(tokenUri, HttpMethod.POST, entity,
                new ParameterizedTypeReference<Map<String, Object>>() {
                });

        if (response.getBody() == null || !response.getBody().containsKey("access_token")) {
            throw new RuntimeException("Failed to retrieve access token");
        }

        return (String) response.getBody().get("access_token");
    }

    private Map<String, Object> fetchUserInfo(String provider, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        String userInfoUri = "google".equalsIgnoreCase(provider) ? GOOGLE_USER_INFO_URI : GITHUB_USER_INFO_URI;
        return restTemplate
                .exchange(userInfoUri, HttpMethod.GET, entity, new ParameterizedTypeReference<Map<String, Object>>() {
                }).getBody();
    }
}
