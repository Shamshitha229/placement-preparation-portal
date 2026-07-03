package com.placementportal.controller;

import com.placementportal.dto.MockTestResultResponse;
import com.placementportal.dto.MockTestStartResponse;
import com.placementportal.dto.MockTestSubmitRequest;
import com.placementportal.service.MockTestService;
import com.placementportal.util.AuthHelper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mocktests")
public class MockTestController {

@Autowired
private MockTestService mockTestService;

@Autowired
private AuthHelper authHelper;

@PostMapping("/start")
public ResponseEntity<MockTestStartResponse> startTest() {
    return ResponseEntity.ok(
            mockTestService.startTest(
                    authHelper.getCurrentUserId()
            )
    );
}

@PostMapping("/submit")
public ResponseEntity<MockTestResultResponse> submitTest(
        @Valid @RequestBody MockTestSubmitRequest request) {

    return ResponseEntity.ok(
            mockTestService.submitTest(
                    authHelper.getCurrentUserId(),
                    request
            )
    );
}

@GetMapping("/result/{testId}")
public ResponseEntity<MockTestResultResponse> getResult(
        @PathVariable Long testId) {

    return ResponseEntity.ok(
            mockTestService.getResult(
                    authHelper.getCurrentUserId(),
                    testId
            )
    );
}

@GetMapping("/history")
public ResponseEntity<List<MockTestResultResponse>> getHistory() {
    return ResponseEntity.ok(
            mockTestService.getHistory(
                    authHelper.getCurrentUserId()
            )
    );
}

}
