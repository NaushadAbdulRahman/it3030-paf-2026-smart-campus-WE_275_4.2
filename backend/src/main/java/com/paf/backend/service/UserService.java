package com.paf.backend.service;

import com.paf.backend.dto.request.RoleUpdateRequest;
import com.paf.backend.dto.response.UserResponse;
import com.paf.backend.enums.Role;
import com.paf.backend.exception.CustomAccessDeniedException;
import com.paf.backend.exception.ResourceNotFoundException;
import com.paf.backend.model.User;
import com.paf.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    /**
     * Get or create user by email. Auto-creates with USER role on first encounter.
     */
    public User getOrCreateUser(String email) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    String name = email.contains("@")
                            ? email.substring(0, email.indexOf("@"))
                            : email;
                    // Capitalize first letter
                    name = name.substring(0, 1).toUpperCase() + name.substring(1);

                    User user = User.builder()
                            .email(email)
                            .name(name)
                            .role(Role.USER)
                            .build();
                    return userRepository.save(user);
                });
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = getOrCreateUser(email);
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getTechnicians() {
        return userRepository.findByRole(Role.TECHNICIAN).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public UserResponse updateRole(Long userId, RoleUpdateRequest request, String adminEmail) {
        // Verify requester is admin
        User admin = getOrCreateUser(adminEmail);
        if (admin.getRole() != Role.ADMIN) {
            throw new CustomAccessDeniedException("Only admins can change roles");
        }

        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        target.setRole(request.getRole());
        return toResponse(userRepository.save(target));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
