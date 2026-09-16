package com.placementportal.repository;

import com.placementportal.entity.Progress;
import com.placementportal.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {
    List<Progress> findByUserId(Long userId);
    List<Progress> findByUserIdAndCategory(Long userId, Question.Category category);
    long countByUserId(Long userId);
    long countByUserIdAndIsCorrect(Long userId, boolean isCorrect);

    List<Progress> findTop10ByUserIdOrderByAttemptedAtDesc(Long userId);

    @Query("SELECT p.category, COUNT(p), SUM(CASE WHEN p.isCorrect = true THEN 1 ELSE 0 END) " +
           "FROM Progress p WHERE p.user.id = :userId GROUP BY p.category")
    List<Object[]> getCategoryStats(@Param("userId") Long userId);
}
