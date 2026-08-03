package com.aichat.backend.security;

import com.aichat.backend.entity.User;
import com.aichat.backend.repository.UserRepository;
import com.aichat.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private static final String BEARER_PREFIX =
            "Bearer ";

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.jwtService =
                jwtService;

        this.userRepository =
                userRepository;
    }

    @Override
    protected boolean shouldNotFilterAsyncDispatch() {
        return false;
    }

    @Override
    protected boolean shouldNotFilterErrorDispatch() {
        return true;
    }

    @Override
    protected boolean shouldNotFilter(
            @NonNull HttpServletRequest request
    ) {
        String path =
                request.getServletPath();

        if (
                path.startsWith(
                        "/api/auth/"
                )
        ) {
            return true;
        }

        return "OPTIONS".equalsIgnoreCase(
                request.getMethod()
        );
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            if (hasAuthentication()) {
                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }

            String authorizationHeader =
                    request.getHeader(
                            "Authorization"
                    );

            if (
                    !hasBearerToken(
                            authorizationHeader
                    )
            ) {
                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }

            String token =
                    extractToken(
                            authorizationHeader
                    );

            String email =
                    jwtService.extractEmail(
                            token
                    );

            if (
                    email == null ||
                    email.isBlank()
            ) {
                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }

            User user =
                    userRepository
                            .findByEmail(email)
                            .orElse(null);

            if (
                    user != null &&
                    jwtService.isTokenValid(
                            token,
                            email
                    )
            ) {
                user.setLastActiveAt(
                        LocalDateTime.now()
                );

                userRepository.save(
                        user
                );

                setAuthentication(
                        request,
                        user
                );
            }

        } catch (Exception exception) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(
                request,
                response
        );
    }

    private boolean hasAuthentication() {
        return SecurityContextHolder
                .getContext()
                .getAuthentication() != null;
    }

    private boolean hasBearerToken(
            String authorizationHeader
    ) {
        return authorizationHeader != null
                &&
                authorizationHeader.startsWith(
                        BEARER_PREFIX
                )
                &&
                authorizationHeader.length() >
                        BEARER_PREFIX.length();
    }

    private String extractToken(
            String authorizationHeader
    ) {
        return authorizationHeader
                .substring(
                        BEARER_PREFIX.length()
                )
                .trim();
    }

    private void setAuthentication(
            HttpServletRequest request,
            User user
    ) {
        String role =
                "ROLE_" +
                user.getRole().name();

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        null,
                        List.of(
                                new SimpleGrantedAuthority(
                                        role
                                )
                        )
                );

        authentication.setDetails(
                new WebAuthenticationDetailsSource()
                        .buildDetails(
                                request
                        )
        );

        SecurityContext context =
                SecurityContextHolder
                        .createEmptyContext();

        context.setAuthentication(
                authentication
        );

        SecurityContextHolder.setContext(
                context
        );
    }
}