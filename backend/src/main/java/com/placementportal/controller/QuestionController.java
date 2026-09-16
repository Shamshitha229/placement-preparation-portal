package com.placementportal.controller;

import com.placementportal.dto.QuestionRequest;
import com.placementportal.dto.QuestionResponse;
import com.placementportal.service.QuestionService;
import com.placementportal.util.AuthHelper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    @Autowired private QuestionService questionService;
    @Autowired private AuthHelper authHelper;

    @GetMapping
    public ResponseEntity<List<QuestionResponse>> getAll(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String keyword) {
        Long userId = tryGetUserId();
        return ResponseEntity.ok(questionService.getAllQuestions(category, company, difficulty, keyword, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionResponse> getOne(@PathVariable Long id) {
        Long userId = tryGetUserId();
        return ResponseEntity.ok(questionService.getQuestion(id, userId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<QuestionResponse>> search(@RequestParam String keyword) {
        Long userId = tryGetUserId();
        return ResponseEntity.ok(questionService.searchQuestions(keyword, userId));
    }

    @GetMapping("/companies")
    public ResponseEntity<List<String>> getCompanies() {
        return ResponseEntity.ok(questionService.getCompanies());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionResponse> create(@Valid @RequestBody QuestionRequest req) {
        return ResponseEntity.ok(questionService.createQuestion(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionResponse> update(@PathVariable Long id, @Valid @RequestBody QuestionRequest req) {
        return ResponseEntity.ok(questionService.updateQuestion(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    private Long tryGetUserId() {
        try {
            return authHelper.getCurrentUserId();
        } catch (Exception e) {
            return null;
        }
    }
}
