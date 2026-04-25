package com.paf.backend.dto.request;

import com.paf.backend.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoleUpdateRequest {

    @NotNull(message = "Role is required")
    private Role role;
}
