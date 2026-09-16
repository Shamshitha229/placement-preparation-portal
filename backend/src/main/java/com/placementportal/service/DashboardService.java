package com.placementportal.service;

import com.placementportal.dto.DashboardResponse;
import com.placementportal.entity.MockTest;
import com.placementportal.entity.Progress;
import com.placementportal.repository.BookmarkRepository;
import com.placementportal.repository.MockTestRepository;
import com.placementportal.repository.ProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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

        List<Object[]> categoryStats = progressRepository.getCategoryStats(userId);
        Map<String, DashboardResponse.CategoryStat> categoryMap = new HashMap<>();

        List<String> weakAreas = new ArrayList<>();
        List<String> strongAreas = new ArrayList<>();
        String lowestCategory = null;
        double lowestAccuracy = 101.0;

        for (Object[] row : categoryStats) {
            String category = row[0].toString();
            long attempted = ((Number) row[1]).longValue();
            long correctAnswers = ((Number) row[2]).longValue();

            DashboardResponse.CategoryStat stat = new DashboardResponse.CategoryStat(attempted, correctAnswers);
            categoryMap.put(category, stat);

            if (attempted >= 2) {
                if (stat.getAccuracy() < 60.0) {
                    weakAreas.add(category);
                } else if (stat.getAccuracy() >= 75.0) {
                    strongAreas.add(category);
                }

                if (stat.getAccuracy() < lowestAccuracy) {
                    lowestAccuracy = stat.getAccuracy();
                    lowestCategory = category;
                }
            }
        }

        String recommendedCategory;
        String recommendationMessage;

        if (total == 0) {
            recommendedCategory = "APTITUDE";
            recommendationMessage = "Start practicing Aptitude questions to establish your baseline placement readiness.";
        } else if (lowestCategory != null) {
            recommendedCategory = lowestCategory;
            String readable = lowestCategory.replace('_', ' ');
            recommendationMessage = readable + " practice is recommended — your current accuracy is " + lowestAccuracy + "% here.";
        } else {
            recommendedCategory = "TECHNICAL";
            recommendationMessage = "Consistent practice leads to placement success. Keep taking mock tests!";
        }

        // Fetch recent activities
        List<Progress> recent = progressRepository.findTop10ByUserIdOrderByAttemptedAtDesc(userId);
        List<DashboardResponse.RecentActivityItem> recentItems = new ArrayList<>();
        for (Progress p : recent) {
            String qText = p.getQuestion() != null ? p.getQuestion().getQuestionText() : "Question";
            recentItems.add(new DashboardResponse.RecentActivityItem(
                    p.getQuestion() != null ? p.getQuestion().getId() : null,
                    qText,
                    p.getCategory() != null ? p.getCategory().name() : "GENERAL",
                    Boolean.TRUE.equals(p.getIsCorrect()),
                    p.getSelectedOption(),
                    p.getAttemptedAt()
            ));
        }

        DashboardResponse response = new DashboardResponse();
        response.setTotalAttempted(total);
        response.setCorrectAnswers(correct);
        response.setWrongAnswers(total - correct);
        response.setAccuracy(accuracy);
        response.setBookmarkedQuestions(bookmarks);
        response.setMockTestsCompleted(mockTests);
        response.setCategoryStats(categoryMap);
        response.setWeakAreas(weakAreas);
        response.setStrongAreas(strongAreas);
        response.setRecommendedCategory(recommendedCategory);
        response.setRecommendationMessage(recommendationMessage);
        response.setRecentActivities(recentItems);

        return response;
    }
}