package com.paf.backend.controller;

import com.paf.backend.dto.request.LoginRequest;
import com.paf.backend.dto.request.RegisterRequest;
import com.paf.backend.dto.response.ApiResponse;
import com.paf.backend.dto.response.AuthResponse;
import com.paf.backend.dto.response.UserResponse;
import com.paf.backend.enums.Role;
import com.paf.backend.model.User;
import com.paf.backend.repository.UserRepository;
import com.paf.backend.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * POST /api/auth/register — Create new account with email/password
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.<AuthResponse>builder()
                            .success(false)
                            .message("Email already registered. Please sign in.")
                            .build());
        }

        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", buildAuthResponse(user, token)));
    }

    /**
     * POST /api/auth/login — Sign in with email/password
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null || user.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<AuthResponse>builder()
                            .success(false)
                            .message("Invalid email or password")
                            .build());
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<AuthResponse>builder()
                            .success(false)
                            .message("Invalid email or password")
                            .build());
        }

        String token = jwtUtil.generateToken(user);

        return ResponseEntity.ok(
                ApiResponse.success("Login successful", buildAuthResponse(user, token)));
    }

    /**
     * GET /api/auth/me — Returns the currently authenticated user
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<UserResponse>builder()
                            .success(false)
                            .message("Not authenticated")
                            .build());
        }

        return ResponseEntity.ok(ApiResponse.success("Current user",
                UserResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole())
                        .createdAt(user.getCreatedAt())
                        .build()));
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .profilePictureUrl(user.getProfilePictureUrl())
                .build();
    }
}
