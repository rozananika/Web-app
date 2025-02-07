package com.library.controller;

import com.library.model.Book;
import com.library.model.User;
import com.library.repository.UserRepository;
import com.library.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/personalized")
    public ResponseEntity<List<Book>> getPersonalizedRecommendations() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Book> recommendations = recommendationService.getPersonalizedRecommendations(user);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/similar/{bookId}")
    public ResponseEntity<List<Book>> getSimilarBooks(@PathVariable Long bookId) {
        List<Book> similarBooks = recommendationService.getSimilarBooks(bookId);
        return ResponseEntity.ok(similarBooks);
    }
}
