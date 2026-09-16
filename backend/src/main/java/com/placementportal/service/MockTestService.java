package com.placementportal.service;

import com.placementportal.dto.*;
import com.placementportal.entity.*;
import com.placementportal.exception.BadRequestException;
import com.placementportal.exception.ResourceNotFoundException;
import com.placementportal.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MockTestService {

    private static final Logger logger = LoggerFactory.getLogger(MockTestService.class);

    @Autowired private MockTestRepository mockTestRepository;
    @Autowired private QuestionRepository questionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProgressRepository progressRepository;

    @Transactional
    public MockTestStartResponse startTest(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        List<Question> randomQuestions = questionRepository.findRandomQuestions(30);
        if (randomQuestions.isEmpty()) {
            throw new BadRequestException("No questions available for mock test in database");
        }

        MockTest test = new MockTest();
        test.setUser(user);
        test.setTotalQuestions(randomQuestions.size());
        test = mockTestRepository.save(test);

        for (Question q : randomQuestions) {
            MockTestQuestion mtq = new MockTestQuestion();
            mtq.setMockTest(test);
            mtq.setQuestion(q);
            test.getQuestions().add(mtq);
        }
        mockTestRepository.save(test);

        MockTestStartResponse res = new MockTestStartResponse();
        res.setTestId(test.getId());
        res.setStartedAt(test.getStartedAt());
        res.setTimeLimit(1800); // 30 minutes in seconds
        res.setQuestions(randomQuestions.stream().map(q -> {
            QuestionResponse qr = QuestionResponse.from(q);
            qr.setCorrectOption(null); // don't expose answer during test
            qr.setExplanation(null);
            return qr;
        }).collect(Collectors.toList()));

        logger.info("Started mock test id: {} for user id: {} with {} questions", test.getId(), userId, randomQuestions.size());
        return res;
    }

    @Transactional
    public MockTestResultResponse submitTest(Long userId, MockTestSubmitRequest req) {
        MockTest test = mockTestRepository.findByIdAndUserId(req.getTestId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Mock test not found with id: " + req.getTestId()));

        if (test.getStatus() == MockTest.Status.COMPLETED) {
            throw new BadRequestException("This mock test has already been submitted");
        }

        Map<Long, String> answers = req.getAnswers() != null ? req.getAnswers() : Map.of();
        int correct = 0, wrong = 0, unanswered = 0;

        for (MockTestQuestion mtq : test.getQuestions()) {
            String selected = answers.get(mtq.getQuestion().getId());
            if (selected == null || selected.isBlank()) {
                unanswered++;
                mtq.setIsCorrect(false);
            } else {
                boolean isCorrect = mtq.getQuestion().getCorrectOption().equalsIgnoreCase(selected);
                mtq.setSelectedOption(selected.toUpperCase());
                mtq.setIsCorrect(isCorrect);
                if (isCorrect) {
                    correct++;
                } else {
                    wrong++;
                }

                // Also persist student progress record
                Progress progress = new Progress();
                progress.setUser(test.getUser());
                progress.setQuestion(mtq.getQuestion());
                progress.setSelectedOption(selected.toUpperCase());
                progress.setIsCorrect(isCorrect);
                progress.setCategory(mtq.getQuestion().getCategory());
                progressRepository.save(progress);
            }
        }

        int total = test.getQuestions().size();
        BigDecimal score = total > 0
                ? BigDecimal.valueOf((double) correct / total * 100).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        test.setCorrectAnswers(correct);
        test.setWrongAnswers(wrong);
        test.setScore(score);
        test.setTimeTaken(req.getTimeTaken() != null ? req.getTimeTaken() : 0);
        test.setStatus(MockTest.Status.COMPLETED);
        test.setCompletedAt(LocalDateTime.now());
        mockTestRepository.save(test);

        logger.info("Submitted mock test id: {} for user: {} - Score: {}%", test.getId(), userId, score);
        return buildResult(test, unanswered);
    }

    public MockTestResultResponse getResult(Long userId, Long testId) {
        MockTest test = mockTestRepository.findByIdAndUserId(testId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Mock test not found with id: " + testId));
        int unanswered = (int) test.getQuestions().stream()
                .filter(q -> q.getSelectedOption() == null).count();
        return buildResult(test, unanswered);
    }

    public List<MockTestResultResponse> getHistory(Long userId) {
        return mockTestRepository.findByUserIdOrderByStartedAtDesc(userId).stream()
                .map(t -> {
                    int u = (int) t.getQuestions().stream().filter(q -> q.getSelectedOption() == null).count();
                    return buildResult(t, u);
                }).collect(Collectors.toList());
    }

    private MockTestResultResponse buildResult(MockTest test, int unanswered) {
        MockTestResultResponse res = new MockTestResultResponse();
        res.setTestId(test.getId());
        res.setTotalQuestions(test.getTotalQuestions());
        res.setCorrectAnswers(test.getCorrectAnswers());
        res.setWrongAnswers(test.getWrongAnswers());
        res.setUnanswered(unanswered);
        res.setScore(test.getScore());
        res.setTimeTaken(test.getTimeTaken());
        res.setStatus(test.getStatus().name());
        res.setCompletedAt(test.getCompletedAt());

        List<MockTestResultResponse.QuestionResultDetail> details = test.getQuestions().stream().map(mtq -> {
            MockTestResultResponse.QuestionResultDetail d = new MockTestResultResponse.QuestionResultDetail();
            Question q = mtq.getQuestion();
            d.setQuestionId(q.getId());
            d.setQuestionText(q.getQuestionText());
            d.setOptionA(q.getOptionA());
            d.setOptionB(q.getOptionB());
            d.setOptionC(q.getOptionC());
            d.setOptionD(q.getOptionD());
            d.setSelectedOption(mtq.getSelectedOption());
            d.setCorrectOption(q.getCorrectOption());
            d.setCorrect(Boolean.TRUE.equals(mtq.getIsCorrect()));
            d.setExplanation(q.getExplanation());
            return d;
        }).collect(Collectors.toList());

        res.setQuestionDetails(details);
        return res;
    }
}
