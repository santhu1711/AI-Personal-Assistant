package com.aichat.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class ProfileController {

    @GetMapping("/profile")
    public Map<String, String> getProfile(
            Authentication authentication
    ) {

        Map<String, String> response =
                new LinkedHashMap<>();

        response.put(
                "email",
                authentication.getName()
        );

        response.put(
                "message",
                "Protected API accessed successfully"
        );

        return response;
    }
}