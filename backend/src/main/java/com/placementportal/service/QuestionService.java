package com.placementportal.service;

import com.placementportal.dto.QuestionRequest;
import com.placementportal.dto.QuestionResponse;
import com.placementportal.entity.Question;
import com.placementportal.exception.ResourceNotFoundException;
import com.placementportal.repository.BookmarkRepository;
import com.placementportal.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private BookmarkRepository bookmarkRepository;

    public List<QuestionResponse> getAllQuestions(
            String category,
            String company,
            String difficulty,
            Long userId) {
        return getAllQuestions(category, company, difficulty, null, userId);
    }

    public List<QuestionResponse> getAllQuestions(
            String category,
            String company,
            String difficulty,
            String keyword,
            Long userId) {

        Question.Category cat = parseCategory(category);
        Question.Difficulty diff = parseDifficulty(difficulty);
        String comp = StringUtils.hasText(company) && !"ALL".equalsIgnoreCase(company.trim()) ? company.trim() : null;
        String kw = StringUtils.hasText(keyword) ? keyword.trim() : null;

        Page<Question> page = questionRepository.findWithFiltersAndKeyword(
                cat,
                comp,
                diff,
                kw,
                PageRequest.of(0, 1000, Sort.by("id").ascending())
        );

        return page.getContent()
                .stream()
                .map(q -> {
                    QuestionResponse r = QuestionResponse.from(q);
                    if (userId != null) {
                        r.setBookmarked(bookmarkRepository.existsByUserIdAndQuestionId(userId, q.getId()));
                    }
                    return r;
                })
                .collect(Collectors.toList());
    }

    public QuestionResponse getQuestion(Long id, Long userId) {
        Question q = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + id));

        QuestionResponse r = QuestionResponse.from(q);
        if (userId != null) {
            r.setBookmarked(bookmarkRepository.existsByUserIdAndQuestionId(userId, id));
        }
        return r;
    }

    @Transactional
    public QuestionResponse createQuestion(QuestionRequest req) {
        Question q = new Question();
        mapToEntity(req, q);
        return QuestionResponse.from(questionRepository.save(q));
    }

    @Transactional
    public QuestionResponse updateQuestion(Long id, QuestionRequest req) {
        Question q = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + id));

        mapToEntity(req, q);
        return QuestionResponse.from(questionRepository.save(q));
    }

    @Transactional
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Question not found: " + id);
        }
        questionRepository.deleteById(id);
    }

    public List<QuestionResponse> searchQuestions(String keyword, Long userId) {
        if (!StringUtils.hasText(keyword)) {
            return getAllQuestions(null, null, null, null, userId);
        }
        return questionRepository.searchByKeyword(keyword.trim())
                .stream()
                .map(q -> {
                    QuestionResponse r = QuestionResponse.from(q);
                    if (userId != null) {
                        r.setBookmarked(bookmarkRepository.existsByUserIdAndQuestionId(userId, q.getId()));
                    }
                    return r;
                })
                .collect(Collectors.toList());
    }

    public List<QuestionResponse> searchQuestions(String keyword) {
        return searchQuestions(keyword, null);
    }

    public List<String> getCompanies() {
        return questionRepository.findDistinctCompanies();
    }

    private Question.Category parseCategory(String category) {
        if (!StringUtils.hasText(category) || "ALL".equalsIgnoreCase(category.trim())) {
            return null;
        }
        try {
            return Question.Category.valueOf(category.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private Question.Difficulty parseDifficulty(String difficulty) {
        if (!StringUtils.hasText(difficulty) || "ALL".equalsIgnoreCase(difficulty.trim())) {
            return null;
        }
        try {
            return Question.Difficulty.valueOf(difficulty.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private void mapToEntity(QuestionRequest req, Question q) {
        q.setQuestionText(req.getQuestionText());
        q.setOptionA(req.getOptionA());
        q.setOptionB(req.getOptionB());
        q.setOptionC(req.getOptionC());
        q.setOptionD(req.getOptionD());
        q.setCorrectOption(req.getCorrectOption() != null ? req.getCorrectOption().toUpperCase() : "A");
        q.setExplanation(req.getExplanation());
        q.setCategory(req.getCategory());
        q.setCompany(req.getCompany());
        q.setDifficulty(req.getDifficulty() != null ? req.getDifficulty() : Question.Difficulty.MEDIUM);
    }
}
