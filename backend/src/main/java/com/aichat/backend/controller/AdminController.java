package com.aichat.backend.controller;

import com.aichat.backend.dto.AdminOverviewResponse;
import com.aichat.backend.dto.AdminUserResponse;
import com.aichat.backend.dto.FeedbackResponse;
import com.aichat.backend.service.AdminService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(
            AdminService adminService
    ) {
        this.adminService =
                adminService;
    }

    @GetMapping("/overview")
    public AdminOverviewResponse getOverview() {

        return adminService
                .getOverview();
    }

    @GetMapping("/users")
    public List<AdminUserResponse> getUsers() {

        return adminService
                .getUsers();
    }

    @GetMapping("/feedback")
    public List<FeedbackResponse> getFeedback() {

        return adminService
                .getFeedback();
    }
}