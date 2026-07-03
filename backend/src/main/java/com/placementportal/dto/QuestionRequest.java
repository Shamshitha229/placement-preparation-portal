package com.placementportal.dto;

import com.placementportal.entity.Question;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuestionRequest {

    @NotBlank(message = "Question text is required")
    private String questionText;

    @NotBlank(message = "Option A is required")
    private String optionA;

    @NotBlank(message = "Option B is required")
    private String optionB;

    @NotBlank(message = "Option C is required")
    private String optionC;

    @NotBlank(message = "Option D is required")
    private String optionD;

    @NotBlank(message = "Correct option is required")
    private String correctOption;

    private String explanation;

    @NotNull(message = "Category is required")
    private Question.Category category;

    private String company;

    private Question.Difficulty difficulty = Question.Difficulty.MEDIUM;
}