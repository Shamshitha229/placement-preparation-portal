package com.placementportal.service;

import com.placementportal.dto.DashboardResponse;
import com.placementportal.entity.MockTest;
import com.placementportal.repository.BookmarkRepository;
import com.placementportal.repository.MockTestRepository;
import com.placementportal.repository.ProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private ProgressRepository progressRepository;

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private MockTestRepository mockTestRepository;

    public DashboardResponse getDashboard(Long userId) {

        long total = progressRepository.countByUserId(userId);

        long correct = progressRepository.countByUserIdAndIsCorrect(userId, true);

        long bookmarks = bookmarkRepository.countByUserId(userId);

        long mockTests = mockTestRepository.countByUserIdAndStatus(
                userId,
                MockTest.Status.COMPLETED
        );

        double accuracy = total > 0
                ? Math.round((double) correct / total * 100 * 10.0) / 10.0
                : 0;

        List<Object[]> categoryStats =
                progressRepository.getCategoryStats(userId);

        Map<String, DashboardResponse.CategoryStat> categoryMap =
                new HashMap<>();

        for (Object[] row : categoryStats) {

            String category = row[0].toString();

            long attempted = ((Number) row[1]).longValue();

            long correctAnswers = ((Number) row[2]).longValue();

            categoryMap.put(
                    category,
                    new DashboardResponse.CategoryStat(
                            attempted,
                            correctAnswers
                    )
            );
        }

        DashboardResponse response = new DashboardResponse();

        response.setTotalAttempted(total);

        response.setCorrectAnswers(correct);

        response.setWrongAnswers(total - correct);

        response.setAccuracy(accuracy);

        response.setBookmarkedQuestions(bookmarks);

        response.setMockTestsCompleted(mockTests);

        response.setCategoryStats(categoryMap);

        return response;
    }
}