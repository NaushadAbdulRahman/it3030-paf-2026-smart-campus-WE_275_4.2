package com.paf.backend.dto.response;

import com.paf.backend.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {

    private String token;
    private Long id;
    private String email;
    private String name;
    private Role role;
    private String profilePictureUrl;
}
