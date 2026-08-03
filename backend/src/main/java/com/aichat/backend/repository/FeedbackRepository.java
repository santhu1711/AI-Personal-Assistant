package com.aichat.backend.repository;

import com.aichat.backend.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FeedbackRepository
        extends JpaRepository<Feedback, Long> {

    List<Feedback> findAllByOrderByCreatedAtDesc();

    long countByRating(
            Integer rating
    );

    @Query(
            "SELECT COALESCE(AVG(f.rating), 0) FROM Feedback f"
    )
    double findAverageRating();
}