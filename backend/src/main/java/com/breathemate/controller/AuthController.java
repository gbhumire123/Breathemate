package com.breathemate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.breathemate.model.User;
import com.breathemate.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully");
        return response;
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User user) {
        User existingUser = userRepository.findByEmail(user.getEmail());
        Map<String, String> response = new HashMap<>();
        if (existingUser != null && passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
            response.put("message", "Login successful");
            response.put("token", "dummy-jwt-token"); // Replace with actual JWT generation logic
        } else {
            response.put("message", "Invalid credentials");
        }
        return response;
    }
}