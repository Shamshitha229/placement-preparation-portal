package com.placementportal.dto;

import com.placementportal.entity.Question;
import lombok.Data;

@Data
public class QuestionResponse {

    private Long id;
    private String questionText;

    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    private String correctOption;
    private String explanation;

    private String company;
    private Question.Category category;
    private Question.Difficulty difficulty;

    private boolean bookmarked;

    public static QuestionResponse from(Question q) {

        QuestionResponse r = new QuestionResponse();

        r.setId(q.getId());
        r.setQuestionText(q.getQuestionText());

        r.setOptionA(q.getOptionA());
        r.setOptionB(q.getOptionB());
        r.setOptionC(q.getOptionC());
        r.setOptionD(q.getOptionD());

        r.setCorrectOption(q.getCorrectOption());
        r.setExplanation(q.getExplanation());

        r.setCompany(q.getCompany());
        r.setCategory(q.getCategory());
        r.setDifficulty(q.getDifficulty());

        return r;
    }
}