package com.placementportal.dto;

import lombok.Data;
import java.util.Map;

@Data
public class AdminDashboardResponse {
    private long totalStudents;
    private long totalQuestions;
    private long totalMockTests;
    private Map<String, Long> categoryQuestionCounts;
}
