package com.library.repository;

import com.library.model.BookLending;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface BookLendingRepository extends JpaRepository<BookLending, Long> {
    List<BookLending> findByUserId(Long userId);
    List<BookLending> findByBookId(Long bookId);
    
    @Query("SELECT bl FROM BookLending bl WHERE bl.returnDate IS NULL AND bl.dueDate < :currentDate")
    List<BookLending> findOverdueBooks(LocalDateTime currentDate);
    
    @Query("SELECT bl FROM BookLending bl WHERE bl.userId = :userId AND bl.returnDate IS NULL")
    List<BookLending> findCurrentBorrowingsByUser(Long userId);

    List<BookLending> findByBorrowDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    long countByBorrowDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}
