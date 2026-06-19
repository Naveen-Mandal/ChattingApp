package com.naveenmandal.backend.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserEntityRepository userRepository;

    // Naya user register/save karne ke liye
    @PostMapping("/register")
    public ResponseEntity<UserEntity> registerUser(@RequestBody UserEntity user) {
        if (user.getPublicId() == null) {
            user.setPublicId(UUID.randomUUID().toString());
        }
        return ResponseEntity.ok(userRepository.save(user));
    }

    // Saare registered users ki list nikalne ke liye (React Contact List View)
    @GetMapping
    public ResponseEntity<List<UserEntity>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}