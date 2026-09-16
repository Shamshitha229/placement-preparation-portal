package com.placementportal.config;

import com.placementportal.entity.Role;
import com.placementportal.entity.User;
import com.placementportal.repository.RoleRepository;
import com.placementportal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired private RoleRepository roleRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Initialize roles
        Role studentRole = roleRepository.findByName("STUDENT").orElseGet(() -> {
            logger.info("Initializing role: STUDENT");
            return roleRepository.save(new Role("STUDENT"));
        });

        Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> {
            logger.info("Initializing role: ADMIN");
            return roleRepository.save(new Role("ADMIN"));
        });

        // Initialize default Admin user if missing
        if (!userRepository.existsByEmail("admin@placement.com")) {
            User admin = new User();
            admin.setName("Placement Admin");
            admin.setEmail("admin@placement.com");
            admin.setUsn("ADMIN001");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(adminRole);
            admin.setIsActive(true);
            userRepository.save(admin);
            logger.info("Created default administrator: admin@placement.com / admin123");
        }
    }
}
