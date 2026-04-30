package com.paf.backend.dto.response;

import com.paf.backend.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {

    private Long id;
    private String email;
    private String name;
    private Role role;
    private LocalDateTime createdAt;
}
