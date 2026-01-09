package com.example.todo.security;

import com.example.todo.entity.OAuthCredential;
import com.example.todo.entity.User;
import com.example.todo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId();
        String providerId = oAuth2User.getName(); // Usually 'sub' or 'id'
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        User user;
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Update existing user logic if needed
            updateCredential(user, provider, providerId, email, name);
        } else {
            user = registerNewUser(provider, providerId, email, name);
        }

        return UserPrincipal.create(user, oAuth2User.getAttributes());
    }

    private User registerNewUser(String provider, String providerId, String email, String name) {
        User user = new User();
        user.setEmail(email);
        user.setUsername(email); // Fallback username
        // Generate random username if exists? For now assume email is username base

        OAuthCredential credential = new OAuthCredential();
        credential.setProvider(provider);
        credential.setProviderId(providerId);
        credential.setEmail(email);
        credential.setName(name);
        credential.setUser(user);

        user.getCredentials().add(credential);

        return userRepository.save(user);
    }

    private void updateCredential(User user, String provider, String providerId, String email, String name) {
        // Check if credential exists
        boolean exists = user.getCredentials().stream()
                .anyMatch(c -> c.getProvider().equals(provider) && c.getProviderId().equals(providerId));

        if (!exists) {
            OAuthCredential credential = new OAuthCredential();
            credential.setProvider(provider);
            credential.setProviderId(providerId);
            credential.setEmail(email);
            credential.setName(name);
            credential.setUser(user);
            user.getCredentials().add(credential);
            userRepository.save(user);
        }
    }
}
