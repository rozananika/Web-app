package com.library.dto.analytics;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class LibraryStats {
    private long totalBooks;
    private long totalMembers;
    private long totalAuthors;
    private long activeLendings;
    private long overdueBooks;
    private double averageRating;
    
    private List<TopItemDTO> mostBorrowedBooks;
    private List<TopItemDTO> mostActiveMembers;
    private List<TopItemDTO> highestRatedBooks;
    private Map<String, Long> booksByGenre;
    private Map<String, Long> lendingsByMonth;
}
