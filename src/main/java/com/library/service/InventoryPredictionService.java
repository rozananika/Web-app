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
public class InventoryPredictionService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookLendingRepository lendingRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    public Map<String, Object> analyzeInventory() {
        Map<String, Object> analysis = new HashMap<>();
        
        analysis.put("inventoryHealth", analyzeInventoryHealth());
        analysis.put("demandPredictions", predictDemand());
        analysis.put("acquisitionRecommendations", recommendAcquisitions());
        analysis.put("maintenanceNeeds", analyzeMaintenanceNeeds());
        
        return analysis;
    }

    private List<Map<String, Object>> analyzeInventoryHealth() {
        List<Book> books = bookRepository.findAll();
        
        return books.stream()
            .map(this::calculateInventoryMetrics)
            .collect(Collectors.toList());
    }

    private Map<String, Object> calculateInventoryMetrics(Book book) {
        Map<String, Object> metrics = new HashMap<>();
        List<BookLending> lendings = lendingRepository.findByBookId(book.getId());
        LocalDateTime now = LocalDateTime.now();
        
        metrics.put("bookId", book.getId());
        metrics.put("title", book.getTitle());
        metrics.put("totalCopies", book.getTotalCopies());
        metrics.put("availableCopies", book.getAvailableCopies());
        metrics.put("utilization", calculateUtilization(book, lendings));
        metrics.put("turnoverRate", calculateTurnoverRate(lendings, now));
        metrics.put("condition", assessBookCondition(lendings));
        
        return metrics;
    }

    private double calculateUtilization(Book book, List<BookLending> lendings) {
        if (book.getTotalCopies() == 0) return 0.0;
        
        long activeLendings = lendings.stream()
            .filter(lending -> lending.getReturnDate() == null)
            .count();
        
        return (double) activeLendings / book.getTotalCopies();
    }

    private double calculateTurnoverRate(List<BookLending> lendings, LocalDateTime now) {
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        
        long monthlyLendings = lendings.stream()
            .filter(lending -> lending.getBorrowDate().isAfter(thirtyDaysAgo))
            .count();
        
        return (double) monthlyLendings / 30.0;
    }

    private String assessBookCondition(List<BookLending> lendings) {
        long totalLendings = lendings.size();
        
        if (totalLendings > 100) return "NEEDS_REPLACEMENT";
        if (totalLendings > 50) return "WORN";
        if (totalLendings > 20) return "MODERATE";
        return "GOOD";
    }

    private List<Map<String, Object>> predictDemand() {
        List<Book> books = bookRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        return books.stream()
            .map(book -> {
                Map<String, Object> demand = new HashMap<>();
                List<BookLending> lendings = lendingRepository.findByBookId(book.getId());
                
                demand.put("bookId", book.getId());
                demand.put("title", book.getTitle());
                demand.put("currentDemand", calculateCurrentDemand(lendings, now));
                demand.put("projectedDemand", projectDemand(lendings, now));
                demand.put("seasonalFactors", analyzeSeasonality(lendings));
                
                return demand;
            })
            .collect(Collectors.toList());
    }

    private double calculateCurrentDemand(List<BookLending> lendings, LocalDateTime now) {
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        
        long recentLendings = lendings.stream()
            .filter(lending -> lending.getBorrowDate().isAfter(sevenDaysAgo))
            .count();
        
        return (double) recentLendings / 7.0;
    }

    private Map<String, Double> projectDemand(List<BookLending> lendings, LocalDateTime now) {
        Map<String, Double> projections = new HashMap<>();
        
        // Short-term (7 days)
        projections.put("shortTerm", calculateProjection(lendings, now, 7));
        
        // Medium-term (30 days)
        projections.put("mediumTerm", calculateProjection(lendings, now, 30));
        
        // Long-term (90 days)
        projections.put("longTerm", calculateProjection(lendings, now, 90));
        
        return projections;
    }

    private double calculateProjection(List<BookLending> lendings, LocalDateTime now, int days) {
        LocalDateTime startDate = now.minusDays(days);
        
        long historicalLendings = lendings.stream()
            .filter(lending -> lending.getBorrowDate().isAfter(startDate))
            .count();
        
        double baseProjection = (double) historicalLendings / days;
        double seasonalFactor = calculateSeasonalFactor(lendings, now);
        
        return baseProjection * seasonalFactor;
    }

    private double calculateSeasonalFactor(List<BookLending> lendings, LocalDateTime now) {
        int currentMonth = now.getMonthValue();
        
        Map<Integer, Long> monthlyLendings = lendings.stream()
            .collect(Collectors.groupingBy(
                lending -> lending.getBorrowDate().getMonthValue(),
                Collectors.counting()
            ));
        
        double averageLendings = monthlyLendings.values().stream()
            .mapToLong(Long::longValue)
            .average()
            .orElse(1.0);
        
        return monthlyLendings.getOrDefault(currentMonth, (long) averageLendings) / averageLendings;
    }

    private Map<String, Long> analyzeSeasonality(List<BookLending> lendings) {
        return lendings.stream()
            .collect(Collectors.groupingBy(
                lending -> lending.getBorrowDate().getMonth().toString(),
                Collectors.counting()
            ));
    }

    private List<Map<String, Object>> recommendAcquisitions() {
        List<Book> books = bookRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        return books.stream()
            .map(book -> {
                Map<String, Object> recommendation = new HashMap<>();
                List<BookLending> lendings = lendingRepository.findByBookId(book.getId());
                
                recommendation.put("bookId", book.getId());
                recommendation.put("title", book.getTitle());
                recommendation.put("recommendedCopies", calculateRecommendedCopies(book, lendings, now));
                recommendation.put("priority", calculateAcquisitionPriority(book, lendings, now));
                recommendation.put("reason", determineAcquisitionReason(book, lendings, now));
                
                return recommendation;
            })
            .filter(rec -> (int) rec.get("recommendedCopies") > 0)
            .sorted((a, b) -> ((String) b.get("priority")).compareTo((String) a.get("priority")))
            .collect(Collectors.toList());
    }

    private int calculateRecommendedCopies(Book book, List<BookLending> lendings, LocalDateTime now) {
        double projectedDemand = calculateProjection(lendings, now, 30);
        int currentCopies = book.getTotalCopies();
        int recommendedCopies = (int) Math.ceil(projectedDemand * 1.5);
        
        return Math.max(0, recommendedCopies - currentCopies);
    }

    private String calculateAcquisitionPriority(Book book, List<BookLending> lendings, LocalDateTime now) {
        double utilization = calculateUtilization(book, lendings);
        double demandTrend = calculateDemandTrend(lendings, now);
        
        if (utilization > 0.9 && demandTrend > 1.5) return "HIGH";
        if (utilization > 0.7 || demandTrend > 1.2) return "MEDIUM";
        return "LOW";
    }

    private String determineAcquisitionReason(Book book, List<BookLending> lendings, LocalDateTime now) {
        double utilization = calculateUtilization(book, lendings);
        double demandTrend = calculateDemandTrend(lendings, now);
        String condition = assessBookCondition(lendings);
        
        if (condition.equals("NEEDS_REPLACEMENT")) return "REPLACEMENT_NEEDED";
        if (utilization > 0.9) return "HIGH_UTILIZATION";
        if (demandTrend > 1.5) return "INCREASING_DEMAND";
        return "NORMAL_REPLENISHMENT";
    }

    private double calculateDemandTrend(List<BookLending> lendings, LocalDateTime now) {
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        LocalDateTime sixtyDaysAgo = now.minusDays(60);
        
        long recentLendings = lendings.stream()
            .filter(lending -> lending.getBorrowDate().isAfter(thirtyDaysAgo))
            .count();
        
        long previousLendings = lendings.stream()
            .filter(lending -> 
                lending.getBorrowDate().isAfter(sixtyDaysAgo) && 
                lending.getBorrowDate().isBefore(thirtyDaysAgo))
            .count();
        
        if (previousLendings == 0) return 1.0;
        return (double) recentLendings / previousLendings;
    }

    private List<Map<String, Object>> analyzeMaintenanceNeeds() {
        List<Book> books = bookRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        
        return books.stream()
            .map(book -> {
                Map<String, Object> maintenance = new HashMap<>();
                List<BookLending> lendings = lendingRepository.findByBookId(book.getId());
                
                maintenance.put("bookId", book.getId());
                maintenance.put("title", book.getTitle());
                maintenance.put("condition", assessBookCondition(lendings));
                maintenance.put("maintenanceType", determineMaintenanceType(lendings));
                maintenance.put("priority", calculateMaintenancePriority(book, lendings, now));
                maintenance.put("estimatedCost", estimateMaintenanceCost(lendings));
                
                return maintenance;
            })
            .filter(m -> !m.get("maintenanceType").equals("NONE"))
            .sorted((a, b) -> ((String) b.get("priority")).compareTo((String) a.get("priority")))
            .collect(Collectors.toList());
    }

    private String determineMaintenanceType(List<BookLending> lendings) {
        long totalLendings = lendings.size();
        
        if (totalLendings > 100) return "REPLACEMENT";
        if (totalLendings > 50) return "MAJOR_REPAIR";
        if (totalLendings > 20) return "MINOR_REPAIR";
        return "NONE";
    }

    private String calculateMaintenancePriority(Book book, List<BookLending> lendings, LocalDateTime now) {
        String condition = assessBookCondition(lendings);
        double utilization = calculateUtilization(book, lendings);
        
        if (condition.equals("NEEDS_REPLACEMENT") && utilization > 0.7) return "URGENT";
        if (condition.equals("WORN") && utilization > 0.5) return "HIGH";
        if (condition.equals("MODERATE") && utilization > 0.7) return "MEDIUM";
        return "LOW";
    }

    private double estimateMaintenanceCost(List<BookLending> lendings) {
        String maintenanceType = determineMaintenanceType(lendings);
        
        switch (maintenanceType) {
            case "REPLACEMENT": return 50.0;
            case "MAJOR_REPAIR": return 25.0;
            case "MINOR_REPAIR": return 10.0;
            default: return 0.0;
        }
    }
}
