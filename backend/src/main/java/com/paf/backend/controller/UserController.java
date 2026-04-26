package com.paf.backend.controller;

import com.paf.backend.dto.request.RoleUpdateRequest;
import com.paf.backend.dto.response.ApiResponse;
import com.paf.backend.dto.response.UserResponse;
import com.paf.backend.enums.Role;
import com.paf.backend.model.User;
import com.paf.backend.security.SecurityHelper;
import com.paf.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class UserController {

    private final UserService userService;
    private final SecurityHelper securityHelper;

    /**
     * GET /api/users — Returns all users (admin view)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(
                ApiResponse.success("All users", userService.getAllUsers()));
    }

    /**
     * GET /api/users/technicians — Returns all technicians
     */
    @GetMapping("/technicians")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getTechnicians() {
        return ResponseEntity.ok(
                ApiResponse.success("Technicians", userService.getTechnicians()));
    }

    /**
     * GET /api/users/role/{role} — Returns users with a specific role
     */
    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersByRole(
            @PathVariable Role role) {

        return ResponseEntity.ok(
                ApiResponse.success("Users filtered by role", userService.getUsersByRole(role)));
    }

    /**
     * PUT /api/users/{id}/role — Admin changes a user's role
     */
    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest request) {

        User admin = securityHelper.getCurrentUser();

        return ResponseEntity.ok(
                ApiResponse.success("Role updated",
                        userService.updateRole(id, request, admin.getEmail())));
    }

    /**
     * PUT /api/users/switch-role — Demo endpoint to switch own role for testing
     */
    @PutMapping("/switch-role")
    public ResponseEntity<ApiResponse<UserResponse>> switchRole(
            @RequestParam Role role) {

        User currentUser = securityHelper.getCurrentUser();

        return ResponseEntity.ok(
                ApiResponse.success("Role switched",
                        userService.switchRole(currentUser.getEmail(), role)));
    }
}
