package com.library.service;

import com.library.model.BookLending;
import com.library.repository.BookLendingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private BookLendingRepository lendingRepository;

    @Autowired
    private EmailService emailService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM d, yyyy");

    // Run daily at 9:00 AM
    @Scheduled(cron = "0 0 9 * * *")
    public void sendOverdueNotifications() {
        List<BookLending> overdueBooks = lendingRepository.findOverdueBooks(LocalDateTime.now());
        
        for (BookLending lending : overdueBooks) {
            try {
                emailService.sendOverdueNotification(
                    lending.getUser().getEmail(),
                    lending.getBook().getTitle(),
                    lending.getDueDate().format(DATE_FORMATTER)
                );
            } catch (Exception e) {
                // Log the error but continue processing other notifications
                System.err.println("Failed to send overdue notification: " + e.getMessage());
            }
        }
    }

    // Run daily at 9:00 AM
    @Scheduled(cron = "0 0 9 * * *")
    public void sendDueDateReminders() {
        LocalDateTime tomorrow = LocalDateTime.now().plusDays(1);
        LocalDateTime dayAfterTomorrow = LocalDateTime.now().plusDays(2);
        
        List<BookLending> dueSoonBooks = lendingRepository.findAll().stream()
            .filter(lending -> lending.getReturnDate() == null &&
                    lending.getDueDate().isAfter(tomorrow) &&
                    lending.getDueDate().isBefore(dayAfterTomorrow))
            .toList();

        for (BookLending lending : dueSoonBooks) {
            try {
                emailService.sendDueDateReminder(
                    lending.getUser().getEmail(),
                    lending.getBook().getTitle(),
                    lending.getDueDate().format(DATE_FORMATTER)
                );
            } catch (Exception e) {
                System.err.println("Failed to send due date reminder: " + e.getMessage());
            }
        }
    }
}
