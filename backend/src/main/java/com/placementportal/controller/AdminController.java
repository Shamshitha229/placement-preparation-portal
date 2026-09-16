package com.placementportal.controller;

import com.placementportal.dto.AdminDashboardResponse;
import com.placementportal.dto.StudentSummaryResponse;
import com.placementportal.entity.Question;
import com.placementportal.entity.User;
import com.placementportal.repository.MockTestRepository;
import com.placementportal.repository.QuestionRepository;
import com.placementportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private QuestionRepository questionRepository;
    @Autowired private MockTestRepository mockTestRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        long studentCount = userRepository.countByRoleName("STUDENT");
        long questionCount = questionRepository.count();
        long mockTestCount = mockTestRepository.count();

        Map<String, Long> categoryCounts = new HashMap<>();
        for (Question.Category cat : Question.Category.values()) {
            categoryCounts.put(cat.name(), questionRepository.countByCategory(cat));
        }

        AdminDashboardResponse res = new AdminDashboardResponse();
        res.setTotalStudents(studentCount);
        res.setTotalQuestions(questionCount);
        res.setTotalMockTests(mockTestCount);
        res.setCategoryQuestionCounts(categoryCounts);

        return ResponseEntity.ok(res);
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentSummaryResponse>> getAllStudents() {
        List<User> students = userRepository.findByRoleNameOrderByCreatedAtDesc("STUDENT");

        List<StudentSummaryResponse> list = students.stream().map(u -> {
            StudentSummaryResponse s = new StudentSummaryResponse();
            s.setId(u.getId());
            s.setName(u.getName());
            s.setEmail(u.getEmail());
            s.setUsn(u.getUsn());
            s.setLastLogin(u.getLastLogin());
            s.setActive(Boolean.TRUE.equals(u.getIsActive()));
            s.setCreatedAt(u.getCreatedAt());
            return s;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }
}
