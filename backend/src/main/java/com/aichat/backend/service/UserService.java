package com.aichat.backend.service;

import com.aichat.backend.entity.User;
import com.aichat.backend.entity.UserRole;
import com.aichat.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository =
                userRepository;

        this.passwordEncoder =
                passwordEncoder;

        this.jwtService =
                jwtService;
    }

    public User registerUser(
            User user
    ) {
        String email =
                normalizeEmail(
                        user.getEmail()
                );

        if (email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is required"
            );
        }

        if (
                user.getPassword() == null ||
                user.getPassword().isBlank()
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password is required"
            );
        }

        if (
                userRepository
                        .findByEmail(email)
                        .isPresent()
        ) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists"
            );
        }

        user.setEmail(
                email
        );

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        user.setRole(
                UserRole.USER
        );

        return userRepository.save(
                user
        );
    }

    public String loginUser(
            String email,
            String password
    ) {
        String normalizedEmail =
                normalizeEmail(
                        email
                );

        if (
                normalizedEmail.isBlank() ||
                password == null ||
                password.isBlank()
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email and password are required"
            );
        }

        User user =
                userRepository
                        .findByEmail(
                                normalizedEmail
                        )
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.UNAUTHORIZED,
                                                "Invalid email or password"
                                        )
                        );

        if (
                !passwordEncoder.matches(
                        password,
                        user.getPassword()
                )
        ) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        LocalDateTime now =
                LocalDateTime.now();

        user.setLastLoginAt(
                now
        );

        user.setLastActiveAt(
                now
        );

        user.setLoginCount(
                safeCount(
                        user.getLoginCount()
                ) + 1
        );

        userRepository.save(
                user
        );

        return jwtService.generateToken(
                user.getEmail()
        );
    }

    private long safeCount(
            Long value
    ) {
        return value == null
                ? 0L
                : value;
    }

    private String normalizeEmail(
            String email
    ) {
        if (email == null) {
            return "";
        }

        return email
                .trim()
                .toLowerCase();
    }
}