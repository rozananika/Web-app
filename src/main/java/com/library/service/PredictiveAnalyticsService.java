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
public class PredictiveAnalyticsService {

    @Autowired
    private BookLendingRepository lendingRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    public Map<String, Object> getPredictions() {
        Map<String, Object> predictions = new HashMap<>();
        
        predictions.put("demandForecast", generateDemandForecast());
        predictions.put("popularityTrends", analyzePopularityTrends());
        predictions.put("returnPredictions", predictReturns());
        predictions.put("genreTrends", analyzeGenreTrends());
        
        return predictions;
    }

    private List<Map<String, Object>> generateDemandForecast() {
        // Get historical lending data
        List<BookLending> historicalLendings = lendingRepository.findAll();
        
        // Group by date and count
        Map<LocalDateTime, Long> dailyCounts = historicalLendings.stream()
            .collect(Collectors.groupingBy(
                lending -> lending.getBorrowDate().truncatedTo(ChronoUnit.DAYS),
                Collectors.counting()
            ));

        // Calculate moving average and trend
        List<Map<String, Object>> forecast = new ArrayList<>();
        LocalDateTime today = LocalDateTime.now().truncatedTo(ChronoUnit.DAYS);
        
        // Predict next 30 days
        for (int i = 0; i < 30; i++) {
            LocalDateTime date = today.plusDays(i);
            double prediction = calculateDemandPrediction(dailyCounts, date);
            
            Map<String, Object> dataPoint = new HashMap<>();
            dataPoint.put("date", date);
            dataPoint.put("predictedDemand", prediction);
            forecast.add(dataPoint);
        }
        
        return forecast;
    }

    private double calculateDemandPrediction(Map<LocalDateTime, Long> historicalData, LocalDateTime targetDate) {
        // Simple exponential smoothing with seasonal adjustment
        double alpha = 0.2; // smoothing factor
        double baseline = historicalData.values().stream()
            .mapToLong(Long::longValue)
            .average()
            .orElse(0.0);
        
        // Apply day-of-week seasonality
        int dayOfWeek = targetDate.getDayOfWeek().getValue();
        double seasonalFactor = calculateSeasonalFactor(historicalData, dayOfWeek);
        
        return baseline * seasonalFactor * (1 + alpha);
    }

    private double calculateSeasonalFactor(Map<LocalDateTime, Long> historicalData, int dayOfWeek) {
        // Calculate average lending count for each day of the week
        Map<Integer, Double> dayAverages = historicalData.entrySet().stream()
            .collect(Collectors.groupingBy(
                entry -> entry.getKey().getDayOfWeek().getValue(),
                Collectors.averagingLong(entry -> entry.getValue())
            ));
        
        double overallAverage = dayAverages.values().stream()
            .mapToDouble(Double::doubleValue)
            .average()
            .orElse(1.0);
        
        return dayAverages.getOrDefault(dayOfWeek, overallAverage) / overallAverage;
    }

    private List<Map<String, Object>> analyzePopularityTrends() {
        List<Book> books = bookRepository.findAll();
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        
        return books.stream()
            .map(book -> {
                Map<String, Object> trend = new HashMap<>();
                trend.put("bookId", book.getId());
                trend.put("title", book.getTitle());
                
                // Calculate recent popularity metrics
                long recentLendings = lendingRepository.countByBookIdAndBorrowDateAfter(
                    book.getId(), thirtyDaysAgo);
                double recentRating = reviewRepository.getAverageRatingForBookAfterDate(
                    book.getId(), thirtyDaysAgo);
                
                trend.put("recentLendings", recentLendings);
                trend.put("recentRating", recentRating);
                trend.put("popularityScore", calculatePopularityScore(recentLendings, recentRating));
                trend.put("trend", calculateTrend(book.getId(), thirtyDaysAgo));
                
                return trend;
            })
            .sorted(Comparator.comparingDouble(trend -> 
                ((Number) trend.get("popularityScore")).doubleValue()))
            .collect(Collectors.toList());
    }

    private double calculatePopularityScore(long lendings, double rating) {
        // Weighted score combining lendings and ratings
        double normalizedLendings = Math.min(lendings / 10.0, 1.0);
        double normalizedRating = rating / 5.0;
        
        return (normalizedLendings * 0.6) + (normalizedRating * 0.4);
    }

    private String calculateTrend(Long bookId, LocalDateTime startDate) {
        long previousPeriodLendings = lendingRepository.countByBookIdAndBorrowDateBetween(
            bookId, startDate.minusDays(30), startDate);
        long currentPeriodLendings = lendingRepository.countByBookIdAndBorrowDateAfter(
            bookId, startDate);
        
        double change = ((double) currentPeriodLendings - previousPeriodLendings) / 
            Math.max(previousPeriodLendings, 1) * 100;
        
        if (change > 20) return "RISING";
        if (change < -20) return "FALLING";
        return "STABLE";
    }

    private List<Map<String, Object>> predictReturns() {
        LocalDateTime today = LocalDateTime.now();
        List<BookLending> activeLendings = lendingRepository.findByReturnDateIsNull();
        
        return activeLendings.stream()
            .map(lending -> {
                Map<String, Object> prediction = new HashMap<>();
                prediction.put("lendingId", lending.getId());
                prediction.put("bookTitle", lending.getBook().getTitle());
                prediction.put("dueDate", lending.getDueDate());
                
                // Calculate return probability
                double returnProbability = calculateReturnProbability(lending);
                prediction.put("returnProbability", returnProbability);
                
                // Predict return status
                String predictedStatus = predictReturnStatus(lending, returnProbability);
                prediction.put("predictedStatus", predictedStatus);
                
                return prediction;
            })
            .collect(Collectors.toList());
    }

    private double calculateReturnProbability(BookLending lending) {
        // Base probability starts at 0.8 (80% chance of return)
        double probability = 0.8;
        
        // Adjust based on user's history
        double userReturnRate = calculateUserReturnRate(lending.getUser().getId());
        probability *= userReturnRate;
        
        // Adjust based on days until due
        long daysUntilDue = ChronoUnit.DAYS.between(LocalDateTime.now(), lending.getDueDate());
        if (daysUntilDue < 0) {
            probability *= 0.5; // Overdue books less likely to be returned promptly
        } else if (daysUntilDue < 3) {
            probability *= 0.9; // Books due soon more likely to be returned
        }
        
        return Math.min(Math.max(probability, 0), 1); // Ensure between 0 and 1
    }

    private double calculateUserReturnRate(Long userId) {
        List<BookLending> userHistory = lendingRepository.findByUserId(userId);
        if (userHistory.isEmpty()) return 1.0;
        
        long onTimeReturns = userHistory.stream()
            .filter(lending -> lending.getReturnDate() != null &&
                !lending.getReturnDate().isAfter(lending.getDueDate()))
            .count();
        
        return (double) onTimeReturns / userHistory.size();
    }

    private String predictReturnStatus(BookLending lending, double probability) {
        if (probability > 0.8) return "LIKELY_ON_TIME";
        if (probability > 0.5) return "POSSIBLY_DELAYED";
        return "LIKELY_OVERDUE";
    }

    private List<Map<String, Object>> analyzeGenreTrends() {
        List<Book> books = bookRepository.findAll();
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        
        // Group books by genre
        Map<String, List<Book>> booksByGenre = books.stream()
            .collect(Collectors.groupingBy(Book::getGenre));
        
        return booksByGenre.entrySet().stream()
            .map(entry -> {
                String genre = entry.getKey();
                List<Book> genreBooks = entry.getValue();
                
                Map<String, Object> trend = new HashMap<>();
                trend.put("genre", genre);
                
                // Calculate genre metrics
                double popularityScore = calculateGenrePopularityScore(genreBooks, thirtyDaysAgo);
                String trendDirection = calculateGenreTrend(genreBooks, thirtyDaysAgo);
                
                trend.put("popularityScore", popularityScore);
                trend.put("trend", trendDirection);
                trend.put("recommendationStrength", calculateRecommendationStrength(
                    popularityScore, trendDirection));
                
                return trend;
            })
            .sorted(Comparator.comparingDouble(trend -> 
                -((Number) trend.get("popularityScore")).doubleValue()))
            .collect(Collectors.toList());
    }

    private double calculateGenrePopularityScore(List<Book> books, LocalDateTime startDate) {
        return books.stream()
            .mapToDouble(book -> {
                long lendings = lendingRepository.countByBookIdAndBorrowDateAfter(
                    book.getId(), startDate);
                double rating = reviewRepository.getAverageRatingForBookAfterDate(
                    book.getId(), startDate);
                return calculatePopularityScore(lendings, rating);
            })
            .average()
            .orElse(0.0);
    }

    private String calculateGenreTrend(List<Book> books, LocalDateTime startDate) {
        double averageChange = books.stream()
            .mapToDouble(book -> {
                long previous = lendingRepository.countByBookIdAndBorrowDateBetween(
                    book.getId(), startDate.minusDays(30), startDate);
                long current = lendingRepository.countByBookIdAndBorrowDateAfter(
                    book.getId(), startDate);
                return ((double) current - previous) / Math.max(previous, 1) * 100;
            })
            .average()
            .orElse(0.0);
        
        if (averageChange > 15) return "RISING";
        if (averageChange < -15) return "FALLING";
        return "STABLE";
    }

    private String calculateRecommendationStrength(double popularityScore, String trend) {
        if (popularityScore > 0.7 && trend.equals("RISING")) return "STRONG";
        if (popularityScore > 0.5 || trend.equals("RISING")) return "MODERATE";
        return "WEAK";
    }
}
