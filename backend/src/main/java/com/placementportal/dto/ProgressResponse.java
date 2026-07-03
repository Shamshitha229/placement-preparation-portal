package com.placementportal.dto;

import com.placementportal.entity.Question;
import lombok.Data;

@Data
public class ProgressResponse {
    private Long id;
    private Long questionId;
    private String selectedOption;
    private boolean correct;
    private String correctOption;
    private String explanation;
    private Question.Category category;
}
