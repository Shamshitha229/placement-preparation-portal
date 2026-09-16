package com.placementportal;

import com.placementportal.dto.DashboardResponse;
import com.placementportal.repository.BookmarkRepository;
import com.placementportal.repository.MockTestRepository;
import com.placementportal.repository.ProgressRepository;
import com.placementportal.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DashboardServiceTest {

    @Mock private ProgressRepository progressRepository;
    @Mock private BookmarkRepository bookmarkRepository;
    @Mock private MockTestRepository mockTestRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void testDashboardWithAttemptsAndWeakAreaDetection() {
        Long userId = 1L;
        when(progressRepository.countByUserId(userId)).thenReturn(10L);
        when(progressRepository.countByUserIdAndIsCorrect(userId, true)).thenReturn(7L);
        when(bookmarkRepository.countByUserId(userId)).thenReturn(3L);
        when(mockTestRepository.countByUserIdAndStatus(userId, com.placementportal.entity.MockTest.Status.COMPLETED)).thenReturn(2L);

        // Technical: 4 attempted, 1 correct (25% accuracy -> Weak)
        // Aptitude: 6 attempted, 6 correct (100% accuracy -> Strong)
        Object[] stat1 = new Object[]{"TECHNICAL", 4L, 1L};
        Object[] stat2 = new Object[]{"APTITUDE", 6L, 6L};
        when(progressRepository.getCategoryStats(userId)).thenReturn(List.of(stat1, stat2));
        when(progressRepository.findTop10ByUserIdOrderByAttemptedAtDesc(userId)).thenReturn(Collections.emptyList());

        DashboardResponse res = dashboardService.getDashboard(userId);

        assertEquals(10L, res.getTotalAttempted());
        assertEquals(7L, res.getCorrectAnswers());
        assertEquals(3L, res.getWrongAnswers());
        assertEquals(70.0, res.getAccuracy());
        assertEquals(3L, res.getBookmarkedQuestions());
        assertEquals(2L, res.getMockTestsCompleted());

        assertTrue(res.getWeakAreas().contains("TECHNICAL"));
        assertTrue(res.getStrongAreas().contains("APTITUDE"));
        assertEquals("TECHNICAL", res.getRecommendedCategory());
        assertTrue(res.getRecommendationMessage().contains("TECHNICAL"));
    }

    @Test
    void testDashboardEmptyState() {
        Long userId = 2L;
        when(progressRepository.countByUserId(userId)).thenReturn(0L);
        when(progressRepository.countByUserIdAndIsCorrect(userId, true)).thenReturn(0L);
        when(bookmarkRepository.countByUserId(userId)).thenReturn(0L);
        when(mockTestRepository.countByUserIdAndStatus(userId, com.placementportal.entity.MockTest.Status.COMPLETED)).thenReturn(0L);
        when(progressRepository.getCategoryStats(userId)).thenReturn(Collections.emptyList());
        when(progressRepository.findTop10ByUserIdOrderByAttemptedAtDesc(userId)).thenReturn(Collections.emptyList());

        DashboardResponse res = dashboardService.getDashboard(userId);

        assertEquals(0L, res.getTotalAttempted());
        assertEquals(0.0, res.getAccuracy());
        assertEquals("APTITUDE", res.getRecommendedCategory());
        assertTrue(res.getWeakAreas().isEmpty());
    }
}
