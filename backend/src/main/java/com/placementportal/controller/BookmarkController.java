package com.placementportal.controller;

import com.placementportal.dto.QuestionResponse;
import com.placementportal.service.BookmarkService;
import com.placementportal.util.AuthHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    @Autowired private BookmarkService bookmarkService;
    @Autowired private AuthHelper authHelper;

    @GetMapping
    public ResponseEntity<List<QuestionResponse>> getBookmarks() {
        return ResponseEntity.ok(bookmarkService.getBookmarks(authHelper.getCurrentUserId()));
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> toggle(@RequestBody Map<String, Long> body) {
        Long questionId = body.get("questionId");
        String action = bookmarkService.toggleBookmark(authHelper.getCurrentUserId(), questionId);
        return ResponseEntity.ok(Map.of("action", action));
    }
}
