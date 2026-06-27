package com.abstorebackend.demo.config;

import com.abstorebackend.demo.entities.AdminUser;
import com.abstorebackend.demo.repositories.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-admin-username:admin}")
    private String seedAdminUsername;

    @Value("${app.seed-admin-password:}")
    private String seedAdminPassword;

    @Override
    public void run(String... args) {
        if (adminUserRepository.count() > 0) {
            return;
        }

        if (seedAdminPassword == null || seedAdminPassword.isBlank()) {
            log.warn("No admin user exists and app.seed-admin-password is not set. Admin seed skipped.");
            return;
        }

        AdminUser admin = new AdminUser();
        admin.setUsername(seedAdminUsername.trim());
        admin.setPassword(passwordEncoder.encode(seedAdminPassword.trim()));
        adminUserRepository.save(admin);
        log.info("Initial admin user '{}' created. Change the password immediately.", seedAdminUsername.trim());
    }
}
