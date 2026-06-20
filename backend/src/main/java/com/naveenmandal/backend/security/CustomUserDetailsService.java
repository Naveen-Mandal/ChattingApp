package com.naveenmandal.backend.security;

import com.naveenmandal.backend.user.UserEntity;
import com.naveenmandal.backend.user.UserEntityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserEntityRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // Allow login by email or username
        UserEntity user = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByUsername(identifier))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or username: " + identifier));

        return new User(
                user.getEmail(),
                user.getPassword(),
                Collections.emptyList() // No roles or authorities needed for simple chat app, but collections are non-emptyable in security context.
        );
    }
}
