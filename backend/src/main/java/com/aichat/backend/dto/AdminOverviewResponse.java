package com.aichat.backend.dto;

public class AdminOverviewResponse {

    private long totalUsers;

    private long activeToday;

    private long activeThisWeek;

    private long activeThisMonth;

    private long totalFeedback;

    private double averageRating;

    private long fiveStarCount;

    private long fourStarCount;

    private long threeStarCount;

    private long twoStarCount;

    private long oneStarCount;

    public AdminOverviewResponse() {
    }

    public AdminOverviewResponse(
            long totalUsers,
            long activeToday,
            long activeThisWeek,
            long activeThisMonth,
            long totalFeedback,
            double averageRating,
            long fiveStarCount,
            long fourStarCount,
            long threeStarCount,
            long twoStarCount,
            long oneStarCount
    ) {
        this.totalUsers =
                totalUsers;

        this.activeToday =
                activeToday;

        this.activeThisWeek =
                activeThisWeek;

        this.activeThisMonth =
                activeThisMonth;

        this.totalFeedback =
                totalFeedback;

        this.averageRating =
                averageRating;

        this.fiveStarCount =
                fiveStarCount;

        this.fourStarCount =
                fourStarCount;

        this.threeStarCount =
                threeStarCount;

        this.twoStarCount =
                twoStarCount;

        this.oneStarCount =
                oneStarCount;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public long getActiveToday() {
        return activeToday;
    }

    public long getActiveThisWeek() {
        return activeThisWeek;
    }

    public long getActiveThisMonth() {
        return activeThisMonth;
    }

    public long getTotalFeedback() {
        return totalFeedback;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public long getFiveStarCount() {
        return fiveStarCount;
    }

    public long getFourStarCount() {
        return fourStarCount;
    }

    public long getThreeStarCount() {
        return threeStarCount;
    }

    public long getTwoStarCount() {
        return twoStarCount;
    }

    public long getOneStarCount() {
        return oneStarCount;
    }
}