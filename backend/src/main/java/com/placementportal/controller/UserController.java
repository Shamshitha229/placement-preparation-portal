package com.placementportal.controller;

import com.placementportal.dto.ChangePasswordRequest;
import com.placementportal.dto.UpdateProfileRequest;
import com.placementportal.dto.UserProfileResponse;
import com.placementportal.entity.User;
import com.placementportal.exception.BadRequestException;
import com.placementportal.repository.UserRepository;
import com.placementportal.util.AuthHelper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired private UserRepository userRepository;
    @Autowired private AuthHelper authHelper;
    @Autowired private PasswordEncoder passwordEncoder;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile() {
        User user = authHelper.getCurrentUser();
        return ResponseEntity.ok(mapToResponse(user));
    }

    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<UserProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest req) {
        User user = authHelper.getCurrentUser();

        if (StringUtils.hasText(req.getName())) {
            user.setName(req.getName().trim());
        }

        if (StringUtils.hasText(req.getUsn())) {
            String newUsn = req.getUsn().trim().toUpperCase();
            if (!newUsn.equalsIgnoreCase(user.getUsn()) && userRepository.existsByUsn(newUsn)) {
                throw new BadRequestException("USN already registered by another student");
            }
            user.setUsn(newUsn);
        }

        userRepository.save(user);
        return ResponseEntity.ok(mapToResponse(user));
    }

    @PutMapping("/change-password")
    @Transactional
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequest req) {
        User user = authHelper.getCurrentUser();

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    private UserProfileResponse mapToResponse(User user) {
        UserProfileResponse res = new UserProfileResponse();
        res.setId(user.getId());
        res.setName(user.getName());
        res.setEmail(user.getEmail());
        res.setUsn(user.getUsn());
        res.setRole(user.getRole() != null ? user.getRole().getName() : "STUDENT");
        res.setCreatedAt(user.getCreatedAt());
        res.setLastLogin(user.getLastLogin());
        return res;
    }
}
