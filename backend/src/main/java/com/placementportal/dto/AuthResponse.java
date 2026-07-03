package com.placementportal.dto;

import lombok.Data;

@Data
public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private Long id;
    private String name;
    private String email;
    private String usn;
    private String role;

    public AuthResponse(String token, Long id, String name, String email, String usn, String role) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.usn = usn;
        this.role = role;
    }
}