package com.placementportal.controller;

import com.placementportal.dto.ProgressRequest;
import com.placementportal.dto.ProgressResponse;
import com.placementportal.service.ProgressService;
import com.placementportal.util.AuthHelper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    @Autowired private ProgressService progressService;
    @Autowired private AuthHelper authHelper;

    @PostMapping
    public ResponseEntity<ProgressResponse> submit(@Valid @RequestBody ProgressRequest req) {
        return ResponseEntity.ok(progressService.submitAnswer(authHelper.getCurrentUserId(), req));
    }

    @GetMapping
    public ResponseEntity<List<ProgressResponse>> get() {
        return ResponseEntity.ok(progressService.getProgress(authHelper.getCurrentUserId()));
    }
}
