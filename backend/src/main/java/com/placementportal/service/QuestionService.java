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

        Question.Category cat =
                category != null ?
                        Question.Category.valueOf(category.toUpperCase())
                        : null;

        Question.Difficulty diff =
                difficulty != null ?
                        Question.Difficulty.valueOf(difficulty.toUpperCase())
                        : null;

        Page<Question> page =
                questionRepository.findWithFilters(
                        cat,
                        company,
                        diff,
                        PageRequest.of(
                                0,
                                1000,
                                Sort.by("createdAt").descending()
                        )
                );

        return page.getContent()
                .stream()
                .map(q -> {
                    QuestionResponse r = QuestionResponse.from(q);

                    if (userId != null) {
                        r.setBookmarked(
                                bookmarkRepository
                                        .existsByUserIdAndQuestionId(
                                                userId,
                                                q.getId()
                                        )
                        );
                    }

                    return r;
                })
                .collect(Collectors.toList());
    }

    public QuestionResponse getQuestion(Long id, Long userId) {

        Question q = questionRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Question not found: " + id
                        )
                );

        QuestionResponse r = QuestionResponse.from(q);

        if (userId != null) {
            r.setBookmarked(
                    bookmarkRepository
                            .existsByUserIdAndQuestionId(
                                    userId,
                                    id
                            )
            );
        }

        return r;
    }

    @Transactional
    public QuestionResponse createQuestion(
            QuestionRequest req) {

        Question q = new Question();

        mapToEntity(req, q);

        return QuestionResponse.from(
                questionRepository.save(q)
        );
    }

    @Transactional
    public QuestionResponse updateQuestion(
            Long id,
            QuestionRequest req) {

        Question q = questionRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Question not found: " + id
                        )
                );

        mapToEntity(req, q);

        return QuestionResponse.from(
                questionRepository.save(q)
        );
    }

    @Transactional
    public void deleteQuestion(Long id) {

        if (!questionRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Question not found: " + id
            );
        }

        questionRepository.deleteById(id);
    }

    public List<QuestionResponse> searchQuestions(
            String keyword) {

        return questionRepository
                .searchByKeyword(keyword)
                .stream()
                .map(QuestionResponse::from)
                .collect(Collectors.toList());
    }

    private void mapToEntity(
            QuestionRequest req,
            Question q) {

        q.setQuestionText(req.getQuestionText());
        q.setOptionA(req.getOptionA());
        q.setOptionB(req.getOptionB());
        q.setOptionC(req.getOptionC());
        q.setOptionD(req.getOptionD());
        q.setCorrectOption(
                req.getCorrectOption().toUpperCase()
        );
        q.setExplanation(req.getExplanation());
        q.setCategory(req.getCategory());
        q.setCompany(req.getCompany());

        q.setDifficulty(
                req.getDifficulty() != null
                        ? req.getDifficulty()
                        : Question.Difficulty.MEDIUM
        );
    }
}
