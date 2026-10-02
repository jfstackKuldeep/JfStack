package com.example.todo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    // 1. REGISTER API
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        // Encrypt password before saving
        User newUser = new User(
            user.getUsername(),
            passwordEncoder.encode(user.getPassword()),
            "ROLE_USER"
        );

        userRepository.save(newUser);
        return ResponseEntity.ok("User registered successfully!");
    }

    // 2. LOGIN API
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        User existingUser = userRepository.findByUsername(user.getUsername())
                .orElse(null);

        if (existingUser != null && passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
            String token = jwtUtils.generateToken(existingUser.getUsername());
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", existingUser.getUsername());
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body("Error: Invalid username or password!");
    }
}
