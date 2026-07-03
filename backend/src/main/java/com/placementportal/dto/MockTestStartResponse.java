package com.placementportal.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class MockTestStartResponse {
    private Long testId;
    private List<QuestionResponse> questions;
    private int timeLimit = 1800; // 30 minutes in seconds
    private LocalDateTime startedAt;
}