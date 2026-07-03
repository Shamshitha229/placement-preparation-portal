package com.placementportal.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;

@Data
public class MockTestSubmitRequest {
    @NotNull(message = "Test ID is required")
    private Long testId;

    private Map<Long, String> answers; // questionId -> selectedOption

    private Integer timeTaken = 0;
}