package com.example.todo.security;

import com.example.todo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try finding by username OR email
        return userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .map(UserPrincipal::create)
                .orElseThrow(
                        () -> new UsernameNotFoundException("User not found with username or email : " + username));
    }

    public UserDetails loadUserById(Long id) {
        return userRepository.findById(id).map(UserPrincipal::create)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id : " + id));
    }
}
