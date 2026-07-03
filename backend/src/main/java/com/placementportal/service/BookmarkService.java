package com.placementportal.service;

import com.placementportal.dto.QuestionResponse;
import com.placementportal.entity.Bookmark;
import com.placementportal.entity.Question;
import com.placementportal.entity.User;
import com.placementportal.exception.BadRequestException;
import com.placementportal.exception.ResourceNotFoundException;
import com.placementportal.repository.BookmarkRepository;
import com.placementportal.repository.QuestionRepository;
import com.placementportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookmarkService {

    @Autowired private BookmarkRepository bookmarkRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private QuestionRepository questionRepository;

    public List<QuestionResponse> getBookmarks(Long userId) {
        return bookmarkRepository.findByUserId(userId).stream()
                .map(b -> {
                    QuestionResponse r = QuestionResponse.from(b.getQuestion());
                    r.setBookmarked(true);
                    return r;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public String toggleBookmark(Long userId, Long questionId) {
        if (bookmarkRepository.existsByUserIdAndQuestionId(userId, questionId)) {
            bookmarkRepository.deleteByUserIdAndQuestionId(userId, questionId);
            return "removed";
        } else {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            Question question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
            Bookmark bookmark = new Bookmark();
            bookmark.setUser(user);
            bookmark.setQuestion(question);
            bookmarkRepository.save(bookmark);
            return "added";
        }
    }
}
