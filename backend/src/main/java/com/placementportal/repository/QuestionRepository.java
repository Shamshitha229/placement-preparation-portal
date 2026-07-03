package com.placementportal.repository;

import com.placementportal.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByCategory(Question.Category category);

    List<Question> findByCompanyIgnoreCase(String company);

    List<Question> findByCategoryAndCompanyIgnoreCase(Question.Category category, String company);

    @Query("SELECT q FROM Question q WHERE " +
           "(:category IS NULL OR q.category = :category) AND " +
           "(:company IS NULL OR LOWER(q.company) = LOWER(:company)) AND " +
           "(:difficulty IS NULL OR q.difficulty = :difficulty)")
    Page<Question> findWithFilters(@Param("category") Question.Category category,
                                   @Param("company") String company,
                                   @Param("difficulty") Question.Difficulty difficulty,
                                   Pageable pageable);

    @Query("SELECT q FROM Question q WHERE LOWER(q.questionText) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Question> searchByKeyword(@Param("keyword") String keyword);

    long countByCategory(Question.Category category);

    @Query(value = "SELECT * FROM questions ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomQuestions(@Param("limit") int limit);
}
