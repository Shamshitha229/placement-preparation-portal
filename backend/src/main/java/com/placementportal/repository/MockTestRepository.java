package com.placementportal.repository;

import com.placementportal.entity.MockTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MockTestRepository extends JpaRepository<MockTest, Long> {
    List<MockTest> findByUserIdOrderByStartedAtDesc(Long userId);
    Optional<MockTest> findByIdAndUserId(Long id, Long userId);
    long countByUserIdAndStatus(Long userId, MockTest.Status status);
    long countByUserId(Long userId);
}
