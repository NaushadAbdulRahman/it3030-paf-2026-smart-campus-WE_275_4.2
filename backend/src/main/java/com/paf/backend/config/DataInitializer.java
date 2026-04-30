package com.paf.backend.config;

import com.paf.backend.enums.Role;
import com.paf.backend.model.User;
import com.paf.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@gmail.com";
    private static final String ADMIN_NAME = "Admin";
    private static final String ADMIN_PASSWORD = "Admin#123";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        userRepository.findByEmail(ADMIN_EMAIL).ifPresentOrElse(
                existing -> {
                    boolean changed = false;
                    if (existing.getRole() != Role.ADMIN) {
                        existing.setRole(Role.ADMIN);
                        changed = true;
                    }
                    if (existing.getPassword() == null
                            || !passwordEncoder.matches(ADMIN_PASSWORD, existing.getPassword())) {
                        existing.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
                        changed = true;
                    }
                    if (changed) {
                        userRepository.save(existing);
                        log.info("Synced default admin account: {}", ADMIN_EMAIL);
                    }
                },
                () -> {
                    User admin = User.builder()
                            .email(ADMIN_EMAIL)
                            .name(ADMIN_NAME)
                            .password(passwordEncoder.encode(ADMIN_PASSWORD))
                            .role(Role.ADMIN)
                            .build();
                    userRepository.save(admin);
                    log.info("Seeded default admin account: {}", ADMIN_EMAIL);
                });
    }
}
