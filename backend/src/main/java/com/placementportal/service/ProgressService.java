package com.placementportal.service;

import com.placementportal.dto.ProgressRequest;
import com.placementportal.dto.ProgressResponse;
import com.placementportal.entity.Progress;
import com.placementportal.entity.Question;
import com.placementportal.entity.User;
import com.placementportal.exception.ResourceNotFoundException;
import com.placementportal.repository.ProgressRepository;
import com.placementportal.repository.QuestionRepository;
import com.placementportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgressService {

    @Autowired private ProgressRepository progressRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private QuestionRepository questionRepository;

    @Transactional
    public ProgressResponse submitAnswer(Long userId, ProgressRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Question question = questionRepository.findById(req.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        boolean isCorrect = question.getCorrectOption().equalsIgnoreCase(req.getSelectedOption());

        Progress progress = new Progress();
        progress.setUser(user);
        progress.setQuestion(question);
        progress.setSelectedOption(req.getSelectedOption().toUpperCase());
        progress.setIsCorrect(isCorrect);
        progress.setCategory(question.getCategory());
        progressRepository.save(progress);

        ProgressResponse res = new ProgressResponse();
        res.setId(progress.getId());
        res.setQuestionId(question.getId());
        res.setSelectedOption(req.getSelectedOption().toUpperCase());
        res.setCorrect(isCorrect);
        res.setCorrectOption(question.getCorrectOption());
        res.setExplanation(question.getExplanation());
        res.setCategory(question.getCategory());
        return res;
    }

    public List<ProgressResponse> getProgress(Long userId) {
        return progressRepository.findByUserId(userId).stream().map(p -> {
            ProgressResponse r = new ProgressResponse();
            r.setId(p.getId());
            r.setQuestionId(p.getQuestion().getId());
            r.setSelectedOption(p.getSelectedOption());
            r.setCorrect(p.getIsCorrect());
            r.setCorrectOption(p.getQuestion().getCorrectOption());
            r.setExplanation(p.getQuestion().getExplanation());
            r.setCategory(p.getCategory());
            return r;
        }).collect(Collectors.toList());
    }
}
