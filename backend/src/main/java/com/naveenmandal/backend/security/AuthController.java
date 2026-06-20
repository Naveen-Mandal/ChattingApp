package com.naveenmandal.backend.security;

import com.naveenmandal.backend.user.UserEntity;
import com.naveenmandal.backend.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("UP");
    }

    @GetMapping("/debug-token")
    public ResponseEntity<?> debugToken(@RequestParam String token) {
        try {
            String username = jwtService.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            boolean isValid = jwtService.isTokenValid(token, userDetails);
            
            return ResponseEntity.ok(java.util.Map.of(
                "username", username,
                "userDetailsUsername", userDetails.getUsername(),
                "isValid", isValid,
                "userDetailsAuthorities", userDetails.getAuthorities()
            ));
        } catch (Exception e) {
            java.io.StringWriter sw = new java.io.StringWriter();
            java.io.PrintWriter pw = new java.io.PrintWriter(sw);
            e.printStackTrace(pw);
            return ResponseEntity.ok(java.util.Map.of(
                "error", e.toString(),
                "stackTrace", sw.toString()
            ));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDto.RegisterRequest request) {
        if (userService.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered");
        }
        if (userService.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username is already taken");
        }

        UserEntity user = UserEntity.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .publicId(UUID.randomUUID().toString())
                .profilePicURL(request.getProfilePicURL())
                .status("ONLINE")
                .build();

        UserEntity savedUser = userService.saveUser(user);
        String token = jwtService.generateToken(savedUser.getEmail());

        return ResponseEntity.ok(AuthDto.AuthResponse.builder()
                .token(token)
                .id(savedUser.getId())
                .publicId(savedUser.getPublicId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDto.LoginRequest request) {
        // Authenticate email + password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserEntity user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + request.getEmail()));

        String token = jwtService.generateToken(user.getEmail());

        return ResponseEntity.ok(AuthDto.AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .publicId(user.getPublicId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build());
    }
}
