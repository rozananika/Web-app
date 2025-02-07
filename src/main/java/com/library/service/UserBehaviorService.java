package com.library.service;

import com.library.model.*;
import com.library.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserBehaviorService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookLendingRepository lendingRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookRepository bookRepository;

    public Map<String, Object> analyzeUserBehavior() {
        Map<String, Object> analysis = new HashMap<>();
        
        analysis.put("userSegments", analyzeUserSegments());
        analysis.put("readingPatterns", analyzeReadingPatterns());
        analysis.put("userRecommendations", generateUserRecommendations());
        analysis.put("retentionRisk", analyzeRetentionRisk());
        
        return analysis;
    }

    private List<Map<String, Object>> analyzeUserSegments() {
        List<User> users = userRepository.findAll();
        
        return users.stream()
            .map(user -> {
                Map<String, Object> segment = new HashMap<>();
                segment.put("userId", user.getId());
                segment.put("username", user.getUsername());
                
                // Calculate user metrics
                UserMetrics metrics = calculateUserMetrics(user);
                segment.put("segment", determineUserSegment(metrics));
                segment.put("metrics", metrics);
                
                return segment;
            })
            .collect(Collectors.toList());
    }

    private UserMetrics calculateUserMetrics(User user) {
        LocalDateTime now = LocalDateTime.now();
        List<BookLending> lendings = lendingRepository.findByUserId(user.getId());
        List<Review> reviews = reviewRepository.findByUserId(user.getId());
        
        UserMetrics metrics = new UserMetrics();
        metrics.setTotalBooksRead(lendings.size());
        metrics.setActiveBookCount(lendings.stream()
            .filter(l -> l.getReturnDate() == null)
            .count());
        metrics.setOverdueCount(lendings.stream()
            .filter(l -> l.getReturnDate() == null && l.getDueDate().isBefore(now))
            .count());
        metrics.setAverageRating(calculateAverageRating(reviews));
        metrics.setReviewCount(reviews.size());
        
        return metrics;
    }

    private String determineUserSegment(UserMetrics metrics) {
        if (metrics.getTotalBooksRead() >= 20 && metrics.getAverageRating() >= 4.0) {
            return "POWER_USER";
        } else if (metrics.getTotalBooksRead() >= 10) {
            return "REGULAR";
        } else if (metrics.getOverdueCount() > 2) {
            return "AT_RISK";
        } else {
            return "NEW_USER";
        }
    }

    private double calculateAverageRating(List<Review> reviews) {
        if (reviews.isEmpty()) {
            return 0.0;
        }
        return reviews.stream()
            .mapToInt(Review::getRating)
            .average()
            .orElse(0.0);
    }

    private Map<String, Object> analyzeReadingPatterns() {
        Map<String, Object> patterns = new HashMap<>();
        List<BookLending> allLendings = lendingRepository.findAll();
        
        // Analyze peak borrowing times
        Map<Integer, Long> hourlyDistribution = allLendings.stream()
            .collect(Collectors.groupingBy(
                l -> l.getBorrowDate().getHour(),
                Collectors.counting()
            ));
        patterns.put("peakHours", findPeakHours(hourlyDistribution));
        
        // Analyze popular genres
        Map<String, Long> genreDistribution = allLendings.stream()
            .map(l -> l.getBook().getGenre())
            .collect(Collectors.groupingBy(
                genre -> genre,
                Collectors.counting()
            ));
        patterns.put("popularGenres", findTopGenres(genreDistribution));
        
        return patterns;
    }

    private List<Integer> findPeakHours(Map<Integer, Long> hourlyDistribution) {
        long maxCount = Collections.max(hourlyDistribution.values());
        return hourlyDistribution.entrySet().stream()
            .filter(e -> e.getValue() == maxCount)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }

    private List<String> findTopGenres(Map<String, Long> genreDistribution) {
        return genreDistribution.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(3)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> generateUserRecommendations() {
        List<User> users = userRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        return users.stream()
            .map(user -> {
                Map<String, Object> recommendation = new HashMap<>();
                recommendation.put("userId", user.getId());
                recommendation.put("username", user.getUsername());
                
                List<Book> recommendedBooks = recommendBooksForUser(user);
                recommendation.put("recommendations", recommendedBooks.stream()
                    .map(Book::getTitle)
                    .collect(Collectors.toList()));
                
                return recommendation;
            })
            .collect(Collectors.toList());
    }

    private List<Book> recommendBooksForUser(User user) {
        List<BookLending> userLendings = lendingRepository.findByUserId(user.getId());
        Set<String> userGenres = userLendings.stream()
            .map(l -> l.getBook().getGenre())
            .collect(Collectors.toSet());
        
        return bookRepository.findAll().stream()
            .filter(book -> userGenres.contains(book.getGenre()))
            .filter(book -> !hasUserBorrowed(userLendings, book))
            .limit(5)
            .collect(Collectors.toList());
    }

    private boolean hasUserBorrowed(List<BookLending> userLendings, Book book) {
        return userLendings.stream()
            .anyMatch(l -> l.getBook().getId().equals(book.getId()));
    }

    private Map<String, Object> analyzeRetentionRisk() {
        Map<String, Object> riskAnalysis = new HashMap<>();
        List<User> users = userRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        List<Map<String, Object>> userRisks = users.stream()
            .map(user -> {
                Map<String, Object> userRisk = new HashMap<>();
                userRisk.put("userId", user.getId());
                userRisk.put("username", user.getUsername());
                
                double retentionScore = calculateRetentionScore(user, now);
                userRisk.put("retentionScore", retentionScore);
                userRisk.put("riskLevel", determineRiskLevel(retentionScore));
                userRisk.put("riskFactors", identifyRiskFactors(user, now));
                
                return userRisk;
            })
            .collect(Collectors.toList());
        
        riskAnalysis.put("userRisks", userRisks);
        return riskAnalysis;
    }

    private double calculateRetentionScore(User user, LocalDateTime now) {
        List<BookLending> lendings = lendingRepository.findByUserId(user.getId());
        
        if (lendings.isEmpty()) {
            return 0.0;
        }

        LocalDateTime lastActivity = lendings.stream()
            .map(BookLending::getBorrowDate)
            .max(LocalDateTime::compareTo)
            .orElse(now);
        
        long daysSinceLastActivity = ChronoUnit.DAYS.between(lastActivity, now);
        double activityScore = Math.max(0.0, 1.0 - (daysSinceLastActivity / 90.0));
        
        double overdueScore = 1.0 - (calculateOverdueRatio(lendings) * 0.5);
        
        return (activityScore * 0.7) + (overdueScore * 0.3);
    }

    private double calculateOverdueRatio(List<BookLending> lendings) {
        if (lendings.isEmpty()) {
            return 0.0;
        }
        
        long overdueCount = lendings.stream()
            .filter(l -> l.getReturnDate() != null && l.getReturnDate().isAfter(l.getDueDate()))
            .count();
        
        return (double) overdueCount / lendings.size();
    }

    private String determineRiskLevel(double retentionScore) {
        if (retentionScore >= 0.8) {
            return "LOW";
        } else if (retentionScore >= 0.5) {
            return "MEDIUM";
        } else {
            return "HIGH";
        }
    }

    private List<String> identifyRiskFactors(User user, LocalDateTime now) {
        List<String> riskFactors = new ArrayList<>();
        List<BookLending> lendings = lendingRepository.findByUserId(user.getId());
        
        if (lendings.isEmpty()) {
            riskFactors.add("NO_ACTIVITY");
            return riskFactors;
        }

        LocalDateTime lastActivity = lendings.stream()
            .map(BookLending::getBorrowDate)
            .max(LocalDateTime::compareTo)
            .orElse(now);
        
        long daysSinceLastActivity = ChronoUnit.DAYS.between(lastActivity, now);
        if (daysSinceLastActivity > 60) {
            riskFactors.add("INACTIVE");
        }
        
        double overdueRatio = calculateOverdueRatio(lendings);
        if (overdueRatio > 0.3) {
            riskFactors.add("HIGH_OVERDUE_RATE");
        }
        
        LocalDateTime midPoint = now.minusMonths(3);
        long recentLendings = lendings.stream()
            .filter(l -> l.getBorrowDate().isAfter(midPoint))
            .count();
        if (recentLendings < 2) {
            riskFactors.add("LOW_RECENT_ACTIVITY");
        }
        
        return riskFactors;
    }

    private static class UserMetrics {
        private int totalBooksRead;
        private long activeBookCount;
        private long overdueCount;
        private double averageRating;
        private int reviewCount;

        public int getTotalBooksRead() { return totalBooksRead; }
        public long getActiveBookCount() { return activeBookCount; }
        public long getOverdueCount() { return overdueCount; }
        public double getAverageRating() { return averageRating; }
        public int getReviewCount() { return reviewCount; }

        public void setTotalBooksRead(int totalBooksRead) { this.totalBooksRead = totalBooksRead; }
        public void setActiveBookCount(long activeBookCount) { this.activeBookCount = activeBookCount; }
        public void setOverdueCount(long overdueCount) { this.overdueCount = overdueCount; }
        public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
        public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }
    }
}
