package com.placementportal.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MockTestResultResponse {
    private Long testId;
    private int totalQuestions;
    private int correctAnswers;
    private int wrongAnswers;
    private int unanswered;
    private BigDecimal score;
    private int timeTaken;
    private String status;
    private LocalDateTime completedAt;
    private List<QuestionResultDetail> questionDetails;

    @Data
    public static class QuestionResultDetail {
        private Long questionId;
        private String questionText;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String selectedOption;
        private String correctOption;
        private boolean correct;
        private String explanation;
    }
}
