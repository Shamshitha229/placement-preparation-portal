package com.placementportal.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StudentSummaryResponse {
    private Long id;
    private String name;
    private String email;
    private String usn;
    private LocalDateTime lastLogin;
    private boolean isActive;
    private LocalDateTime createdAt;
}
