package com.placementportal;

import com.placementportal.dto.QuestionResponse;
import com.placementportal.entity.Question;
import com.placementportal.repository.BookmarkRepository;
import com.placementportal.repository.QuestionRepository;
import com.placementportal.service.QuestionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class QuestionServiceTest {

    @Mock private QuestionRepository questionRepository;
    @Mock private BookmarkRepository bookmarkRepository;

    @InjectMocks
    private QuestionService questionService;

    @Test
    void testGetAllQuestionsSafeEnumHandling() {
        Question q = new Question();
        q.setId(1L);
        q.setQuestionText("What is OOP?");
        q.setOptionA("A");
        q.setOptionB("B");
        q.setOptionC("C");
        q.setOptionD("D");
        q.setCorrectOption("A");
        q.setCategory(Question.Category.TECHNICAL);
        q.setDifficulty(Question.Difficulty.EASY);

        when(questionRepository.findWithFiltersAndKeyword(
                isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(q)));

        // Pass invalid category or empty string - should not throw IllegalArgumentException
        List<QuestionResponse> result = questionService.getAllQuestions("", "", "invalidDiff", "", 1L);
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("What is OOP?", result.get(0).getQuestionText());
    }

    @Test
    void testGetDistinctCompanies() {
        when(questionRepository.findDistinctCompanies()).thenReturn(List.of("Infosys", "TCS", "Wipro"));
        List<String> companies = questionService.getCompanies();
        assertEquals(3, companies.size());
        assertTrue(companies.contains("TCS"));
    }
}
