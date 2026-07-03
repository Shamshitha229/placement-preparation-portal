package com.placementportal.dto;

import lombok.Data;
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
}