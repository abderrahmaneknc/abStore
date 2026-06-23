package com.abstorebackend.demo.controllers;

import com.abstorebackend.demo.dto.PasswordResetRequest;
import com.abstorebackend.demo.entities.AdminUser;
import com.abstorebackend.demo.repositories.AdminUserRepository;
import com.abstorebackend.demo.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private AdminUserRepository adminUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthController authController;

    @Test
    void forgotPasswordShouldAcceptResetKeyWhenConfiguredWithQuotes() {
        ReflectionTestUtils.setField(authController, "adminResetKey", "\"abdelbasetabstore\"");

        AdminUser adminUser = new AdminUser();
        adminUser.setUsername("admin");
        adminUser.setPassword("old-password");

        when(adminUserRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(passwordEncoder.encode("new-password")).thenReturn("encoded-password");
        when(adminUserRepository.saveAndFlush(any(AdminUser.class))).thenReturn(adminUser);

        ResponseEntity<?> response = authController.forgotPassword(
                "abdelbasetabstore",
                new PasswordResetRequest("admin", "new-password"));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Password reset successfully", ((java.util.Map<?, ?>) response.getBody()).get("message"));
    }
}
