package com.paf.backend.security;

import com.paf.backend.model.User;
import com.paf.backend.repository.UserRepository;
import com.paf.backend.enums.Role;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * On successful Google OAuth2 login, find-or-create the User in the DB,
 * generate a JWT, and redirect to the React frontend with the token.
 */
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${app.frontend.url:http://localhost:3001}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name  = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        // Find or create user
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .email(email)
                                .name(name != null ? name : deriveDisplayName(email))
                                .profilePictureUrl(picture)
                                .role(Role.USER)
                                .build()
                ));

        // Update profile picture if changed
        if (picture != null && !picture.equals(user.getProfilePictureUrl())) {
            user.setProfilePictureUrl(picture);
            userRepository.save(user);
        }

        String token = jwtUtil.generateToken(user);

        // Redirect to frontend with JWT
        String redirectUrl = normalizeBaseUrl(frontendUrl) + "/oauth2/callback?token="
                + URLEncoder.encode(token, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }

    private String deriveDisplayName(String email) {
        if (email == null || email.isBlank()) {
            return "user";
        }
        int atIndex = email.indexOf('@');
        return atIndex > 0 ? email.substring(0, atIndex) : email;
    }

    private String normalizeBaseUrl(String url) {
        if (url == null || url.isBlank()) {
            return "http://localhost:3001";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
