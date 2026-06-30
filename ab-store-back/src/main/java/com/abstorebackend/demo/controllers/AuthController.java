package com.abstorebackend.demo.controllers;

import com.abstorebackend.demo.dto.AuthRequest;
import com.abstorebackend.demo.dto.AuthResponse;
import com.abstorebackend.demo.dto.PasswordChangeRequest;
import com.abstorebackend.demo.dto.PasswordResetRequest;
import com.abstorebackend.demo.entities.AdminUser;
import com.abstorebackend.demo.exceptions.BadRequestException;
import com.abstorebackend.demo.exceptions.ResourceNotFoundException;
import com.abstorebackend.demo.repositories.AdminUserRepository;
import com.abstorebackend.demo.security.CustomUserDetails;
import com.abstorebackend.demo.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

        private final AuthenticationManager authenticationManager;
        private final JwtService jwtService;
        private final AdminUserRepository adminUserRepository;
        private final PasswordEncoder passwordEncoder;

        @Value("${app.admin-reset-key:}")
        private String adminResetKey;

        @PostMapping("/login")
        public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                String token = jwtService.generateToken(userDetails);
                return ResponseEntity.ok(new AuthResponse(token));
        }

        @PutMapping("/password")
        public ResponseEntity<?> changePassword(@Valid @RequestBody PasswordChangeRequest request) {

                System.out.println("========== CHANGE PASSWORD ==========");

                try {
                        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                        System.out.println("Authentication object: " + authentication);

                        if (authentication == null) {
                                System.out.println("Authentication is NULL");
                                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                                .body(Map.of("error", "Not authenticated"));
                        }

                        System.out.println("Authenticated: " + authentication.isAuthenticated());
                        System.out.println("Principal: " + authentication.getPrincipal());
                        System.out.println("Username: " + authentication.getName());

                        String username = authentication.getName();

                        AdminUser adminUser = adminUserRepository.findByUsername(username).orElse(null);

                        if (adminUser == null) {
                                System.out.println("Admin user not found in database");
                                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                                .body(Map.of("error", "Authenticated user not found"));
                        }

                        System.out.println("Admin found: " + adminUser.getUsername());

                        boolean currentPasswordMatches = passwordEncoder.matches(request.getCurrentPassword(),
                                        adminUser.getPassword());

                        System.out.println("Current password matches: " + currentPasswordMatches);

                        if (!currentPasswordMatches) {
                                return ResponseEntity.badRequest()
                                                .body(Map.of("error", "Current password is incorrect"));
                        }

                        boolean samePassword = passwordEncoder.matches(request.getNewPassword(),
                                        adminUser.getPassword());

                        System.out.println("New password equals old: " + samePassword);

                        if (samePassword) {
                                return ResponseEntity.badRequest()
                                                .body(Map.of("error",
                                                                "New password must be different from the current password"));
                        }

                        adminUser.setPassword(passwordEncoder.encode(request.getNewPassword()));

                        adminUserRepository.saveAndFlush(adminUser);

                        System.out.println("Password updated successfully.");

                        return ResponseEntity.ok(
                                        Map.of("message", "Password changed successfully"));

                } catch (Exception e) {

                        System.out.println("===== EXCEPTION =====");
                        e.printStackTrace();

                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(Map.of(
                                                        "error", "Internal server error",
                                                        "exception", e.getClass().getSimpleName(),
                                                        "message", e.getMessage()));
                }
        }

        @PostMapping("/forgot-password")
        public ResponseEntity<?> forgotPassword(
                        @RequestHeader(value = "X-Admin-Reset-Key", required = false) String resetKey,
                        @Valid @RequestBody PasswordResetRequest request) {

                String configuredResetKey = adminResetKey == null
                                ? ""
                                : adminResetKey.trim().replace("\"", "");

                if (configuredResetKey.isBlank()) {
                        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                                        .body(Map.of("error", "Service temporarily unavailable"));// reset key is
                                                                                                  // invalid or not
                                                                                                  // configured
                }

                if (resetKey == null
                                || resetKey.trim().isBlank()
                                || !MessageDigest.isEqual(
                                                resetKey.trim().getBytes(StandardCharsets.UTF_8),
                                                configuredResetKey.getBytes(StandardCharsets.UTF_8))) {

                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body(Map.of("error", "Request denied"));
                }

                AdminUser adminUser = adminUserRepository
                                .findByUsername(request.getUsername().trim())
                                .orElse(null);

                if (adminUser == null) {
                        return ResponseEntity.ok(
                                        Map.of("message", "If the request is valid, it has been processed."));
                }

                if (passwordEncoder.matches(request.getNewPassword(), adminUser.getPassword())) {
                        throw new BadRequestException(
                                        "New password must be different from the current password");
                }

                adminUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
                adminUserRepository.saveAndFlush(adminUser);

                return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        }
}
