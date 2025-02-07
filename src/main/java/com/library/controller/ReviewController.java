package com.library.controller;

import com.library.dto.ReviewDTO;
import com.library.model.Book;
import com.library.model.Review;
import com.library.model.User;
import com.library.repository.BookRepository;
import com.library.repository.ReviewRepository;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/book/{bookId}")
    public List<ReviewDTO> getBookReviews(@PathVariable Long bookId) {
        return reviewRepository.findByBookIdAndApprovedTrue(bookId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/my-reviews")
    @PreAuthorize("hasRole('MEMBER')")
    public List<ReviewDTO> getMyReviews() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return reviewRepository.findByUserIdAndApprovedTrue(user.getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @PostMapping("/book/{bookId}")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<?> createReview(
            @PathVariable Long bookId,
            @Valid @RequestBody ReviewDTO reviewDTO) {
        
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = new Review();
        review.setBook(book);
        review.setUser(user);
        review.setRating(reviewDTO.getRating());
        review.setComment(reviewDTO.getComment());
        review.setCreatedAt(LocalDateTime.now());
        review.setApproved(false); // Requires librarian approval

        Review savedReview = reviewRepository.save(review);
        return ResponseEntity.ok(convertToDTO(savedReview));
    }

    @PutMapping("/{reviewId}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<?> approveReview(@PathVariable Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setApproved(true);
        Review updatedReview = reviewRepository.save(review);
        return ResponseEntity.ok(convertToDTO(updatedReview));
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            return ResponseEntity.notFound().build();
        }
        
        reviewRepository.deleteById(reviewId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public List<ReviewDTO> getPendingReviews() {
        return reviewRepository.findByApprovedFalse().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/book/{bookId}/rating")
    public ResponseEntity<Double> getBookAverageRating(@PathVariable Long bookId) {
        Double avgRating = reviewRepository.getAverageRatingForBook(bookId);
        return ResponseEntity.ok(avgRating != null ? avgRating : 0.0);
    }

    private ReviewDTO convertToDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setBookId(review.getBook().getId());
        dto.setUserId(review.getUser().getId());
        dto.setUsername(review.getUser().getUsername());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setApproved(review.isApproved());
        return dto;
    }
}
