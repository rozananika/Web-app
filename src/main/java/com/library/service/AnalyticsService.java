package com.library.service;

import com.library.dto.analytics.LibraryStats;
import com.library.dto.analytics.TopItemDTO;
import com.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {
    

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private BookLendingRepository lendingRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    public LibraryStats getLibraryStats() {
        LibraryStats stats = new LibraryStats();
        
        // Basic counts
        stats.setTotalBooks(bookRepository.count());
        stats.setTotalMembers(userRepository.count());
        stats.setTotalAuthors(authorRepository.count());
        stats.setActiveLendings(lendingRepository.countByReturnDateIsNull());
        stats.setOverdueBooks(lendingRepository.findOverdueBooks(LocalDateTime.now()).size());
        
        // Calculate average rating across all books
        Double avgRating = reviewRepository.findAll().stream()
                .filter(Review::isApproved)
                .mapToInt(r -> r.getRating())
                .average()
                .orElse(0.0);
        stats.setAverageRating(avgRating);

        // Most borrowed books (top 10)
        List<TopItemDTO> mostBorrowed = lendingRepository.findMostBorrowedBooks()
                .stream()
                .limit(10)
                .map(result -> new TopItemDTO(
                    result.getBookId(),
                    result.getBookTitle(),
                    result.getBorrowCount()))
                .collect(Collectors.toList());
        stats.setMostBorrowedBooks(mostBorrowed);

        // Most active members (top 10)
        List<TopItemDTO> activeMembers = lendingRepository.findMostActiveMembers()
                .stream()
                .limit(10)
                .map(result -> new TopItemDTO(
                    result.getUserId(),
                    result.getUsername(),
                    result.getBorrowCount()))
                .collect(Collectors.toList());
        stats.setMostActiveMembers(activeMembers);

        // Highest rated books (top 10)
        List<TopItemDTO> topRated = reviewRepository.findTopRatedBooks()
                .stream()
                .limit(10)
                .map(result -> new TopItemDTO(
                    result.getBookId(),
                    result.getBookTitle(),
                    result.getAverageRating()))
                .collect(Collectors.toList());
        stats.setHighestRatedBooks(topRated);

        // Books by genre
        Map<String, Long> booksByGenre = bookRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                    Book::getGenre,
                    Collectors.counting()));
        stats.setBooksByGenre(booksByGenre);

        // Lendings by month (last 12 months)
        Map<String, Long> lendingsByMonth = lendingRepository.findAll().stream()
                .filter(lending -> lending.getBorrowDate().isAfter(LocalDateTime.now().minusMonths(12)))
                .collect(Collectors.groupingBy(
                    lending -> lending.getBorrowDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                    Collectors.counting()));
        stats.setLendingsByMonth(lendingsByMonth);

        return stats;
    }
}
