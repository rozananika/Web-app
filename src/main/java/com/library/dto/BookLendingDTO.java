package com.library.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookLendingDTO {
    private Long id;
    private Long bookId;
    private Long userId;
    private LocalDateTime borrowDate;
    private LocalDateTime dueDate;
    private LocalDateTime returnDate;
    private String status;
}
