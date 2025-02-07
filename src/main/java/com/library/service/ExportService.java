package com.library.service;

import com.library.model.BookLending;
import com.library.repository.BookLendingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExportService {
    @Autowired
    private BookLendingRepository lendingRepository;

    public String exportLendingHistory(LocalDateTime startDate, LocalDateTime endDate) {
        List<BookLending> lendings = lendingRepository.findByBorrowDateBetween(startDate.toLocalDate(), endDate.toLocalDate());
        StringBuilder report = new StringBuilder();
        report.append("Lending History Report\n");
        report.append("From: ").append(startDate).append(" To: ").append(endDate).append("\n\n");
        
        for (BookLending lending : lendings) {
            report.append("Book: ").append(lending.getBook().getTitle())
                  .append(", User: ").append(lending.getUser().getUsername())
                  .append(", Borrow Date: ").append(lending.getBorrowDate())
                  .append(", Due Date: ").append(lending.getDueDate())
                  .append(", Status: ").append(lending.getStatus())
                  .append("\n");
        }
        
        return report.toString();
    }

    public String exportAnalyticsReport(LocalDateTime startDate, LocalDateTime endDate) {
        StringBuilder report = new StringBuilder();
        report.append("Analytics Report\n");
        report.append("From: ").append(startDate).append(" To: ").append(endDate).append("\n\n");
        
        // Add basic analytics data
        report.append("Total Lendings: ").append(lendingRepository.countByBorrowDateBetween(startDate.toLocalDate(), endDate.toLocalDate()));
        
        return report.toString();
    }
}
