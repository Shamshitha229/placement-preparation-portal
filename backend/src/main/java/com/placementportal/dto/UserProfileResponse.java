package com.placementportal.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String usn;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}
