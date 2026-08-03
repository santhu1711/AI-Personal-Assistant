package com.aichat.backend.repository;

import com.aichat.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User> findByEmail(
            String email
    );

    long countByLastActiveAtAfter(
            LocalDateTime dateTime
    );

    List<User> findAllByOrderByCreatedAtDesc();
}