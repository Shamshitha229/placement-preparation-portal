package com.placementportal;

import com.placementportal.dto.AuthResponse;
import com.placementportal.dto.RegisterRequest;
import com.placementportal.entity.Role;
import com.placementportal.entity.User;
import com.placementportal.exception.BadRequestException;
import com.placementportal.repository.RoleRepository;
import com.placementportal.repository.UserRepository;
import com.placementportal.security.JwtUtil;
import com.placementportal.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setName("John Doe");
        registerRequest.setEmail("john@example.com");
        registerRequest.setUsn("1RN23CS001");
        registerRequest.setPassword("Secret@123");
        registerRequest.setConfirmPassword("Secret@123");
    }

    @Test
    void testRegisterSuccess() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsn(anyString())).thenReturn(false);
        when(roleRepository.findByName("STUDENT")).thenReturn(Optional.of(new Role("STUDENT")));
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtUtil.generateToken(auth)).thenReturn("mockJwtToken");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("mockJwtToken", response.getToken());
        assertEquals("john@example.com", response.getEmail());
        assertEquals("1RN23CS001", response.getUsn());
        assertEquals("STUDENT", response.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegisterPasswordMismatch() {
        registerRequest.setConfirmPassword("DifferentPassword");
        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegisterDuplicateEmail() {
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);
        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
    }

    @Test
    void testRegisterDuplicateUsn() {
        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(userRepository.existsByUsn("1RN23CS001")).thenReturn(true);
        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
    }
}
