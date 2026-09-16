package com.placementportal.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
public class DashboardResponse {

    private long totalAttempted;
    private long correctAnswers;
    private long wrongAnswers;
    private double accuracy;
    private long bookmarkedQuestions;
    private long mockTestsCompleted;
    private Map<String, CategoryStat> categoryStats;

    // Smart Learning Insights
    private List<String> weakAreas = new ArrayList<>();
    private List<String> strongAreas = new ArrayList<>();
    private String recommendedCategory;
    private String recommendationMessage;

    // Activity timeline
    private List<RecentActivityItem> recentActivities = new ArrayList<>();

    @Data
    public static class CategoryStat {
        private long total;
        private long correct;
        private double accuracy;

        public CategoryStat(long total, long correct) {
            this.total = total;
            this.correct = correct;
            this.accuracy = total > 0
                    ? Math.round((double) correct / total * 100 * 10.0) / 10.0
                    : 0;
        }
    }

    @Data
    @NoArgsConstructor
    public static class RecentActivityItem {
        private Long questionId;
        private String questionText;
        private String category;
        private boolean correct;
        private String selectedOption;
        private LocalDateTime attemptedAt;

        public RecentActivityItem(Long questionId, String questionText, String category, boolean correct, String selectedOption, LocalDateTime attemptedAt) {
            this.questionId = questionId;
            this.questionText = questionText;
            this.category = category;
            this.correct = correct;
            this.selectedOption = selectedOption;
            this.attemptedAt = attemptedAt;
        }
    }
}