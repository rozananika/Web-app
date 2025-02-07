package com.library.service;

import com.library.model.Book;
import com.library.model.User;
import com.library.model.BookLending;
import com.library.model.Review;
import com.library.repository.BookRepository;
import com.library.repository.BookLendingRepository;
import com.library.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookLendingRepository lendingRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    public List<Book> getPersonalizedRecommendations(User user) {
        // Get user's reading history
        List<BookLending> userLendings = lendingRepository.findByUserId(user.getId());
        List<Review> userReviews = reviewRepository.findByUserId(user.getId());

        // Get user's preferred genres
        Map<String, Integer> genrePreferences = new HashMap<>();
        Set<Long> readBookIds = new HashSet<>();

        // Analyze borrowed books
        for (BookLending lending : userLendings) {
            Book book = lending.getBook();
            readBookIds.add(book.getId());
            genrePreferences.merge(book.getGenre(), 1, Integer::sum);
        }

        // Analyze highly rated books
        for (Review review : userReviews) {
            if (review.getRating() >= 4) {
                Book book = review.getBook();
                genrePreferences.merge(book.getGenre(), 2, Integer::sum);
            }
        }

        // Get top 3 preferred genres
        List<String> preferredGenres = genrePreferences.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        // Find books in preferred genres that user hasn't read
        List<Book> recommendations = bookRepository.findAll().stream()
                .filter(book -> !readBookIds.contains(book.getId()))
                .filter(book -> preferredGenres.contains(book.getGenre()))
                .sorted(Comparator.comparingDouble(book -> 
                    calculateBookScore(book, preferredGenres.indexOf(book.getGenre()))))
                .limit(10)
                .collect(Collectors.toList());

        return recommendations;
    }

    public List<Book> getSimilarBooks(Long bookId) {
        Book sourceBook = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        return bookRepository.findAll().stream()
                .filter(book -> !book.getId().equals(bookId))
                .filter(book -> book.getGenre().equals(sourceBook.getGenre()))
                .sorted(Comparator.comparingDouble(book -> calculateSimilarity(sourceBook, book)))
                .limit(5)
                .collect(Collectors.toList());
    }

    private double calculateBookScore(Book book, int genrePreference) {
        double score = 0.0;
        
        // Genre preference (0-2, where 0 is most preferred)
        score += (3 - genrePreference) * 0.4;
        
        // Average rating
        Double avgRating = reviewRepository.getAverageRatingForBook(book.getId());
        if (avgRating != null) {
            score += avgRating * 0.3;
        }
        
        // Popularity (number of lendings)
        long lendingCount = lendingRepository.countByBookId(book.getId());
        score += Math.min(lendingCount / 10.0, 1.0) * 0.3;
        
        return score;
    }

    private double calculateSimilarity(Book book1, Book book2) {
        double similarity = 0.0;
        
        // Same genre
        if (book1.getGenre().equals(book2.getGenre())) {
            similarity += 0.4;
        }
        
        // Similar ratings
        Double rating1 = reviewRepository.getAverageRatingForBook(book1.getId());
        Double rating2 = reviewRepository.getAverageRatingForBook(book2.getId());
        if (rating1 != null && rating2 != null) {
            similarity += (1 - Math.abs(rating1 - rating2) / 5.0) * 0.3;
        }
        
        // Common authors
        long commonAuthors = book1.getAuthors().stream()
                .filter(author -> book2.getAuthors().contains(author))
                .count();
        if (commonAuthors > 0) {
            similarity += 0.3;
        }
        
        return similarity;
    }
}
