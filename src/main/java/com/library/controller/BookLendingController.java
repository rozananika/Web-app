package com.library.controller;

import com.library.dto.BookLendingDTO;
import com.library.model.Book;
import com.library.model.BookLending;
import com.library.model.User;
import com.library.repository.BookLendingRepository;
import com.library.repository.BookRepository;
import com.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lendings")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BookLendingController {

    @Autowired
    private BookLendingRepository lendingRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public List<BookLendingDTO> getAllLendings() {
        return lendingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/my-lendings")
    @PreAuthorize("hasRole('MEMBER')")
    public List<BookLendingDTO> getMyLendings() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return lendingRepository.findCurrentBorrowingsByUser(user.getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @PostMapping("/borrow/{bookId}")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<?> borrowBook(@PathVariable Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getAvailableCopies() <= 0) {
            return ResponseEntity.badRequest().body("No copies available");
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BookLending lending = new BookLending();
        lending.setBook(book);
        lending.setUser(user);
        lending.setBorrowDate(LocalDateTime.now());
        lending.setDueDate(LocalDateTime.now().plusDays(14)); // 2 weeks lending period
        lending.setStatus("BORROWED");

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);
        
        BookLending savedLending = lendingRepository.save(lending);
        return ResponseEntity.ok(convertToDTO(savedLending));
    }

    @PostMapping("/return/{lendingId}")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<?> returnBook(@PathVariable Long lendingId) {
        BookLending lending = lendingRepository.findById(lendingId)
                .orElseThrow(() -> new RuntimeException("Lending record not found"));

        if (lending.getReturnDate() != null) {
            return ResponseEntity.badRequest().body("Book already returned");
        }

        lending.setReturnDate(LocalDateTime.now());
        lending.setStatus("RETURNED");

        Book book = lending.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        BookLending savedLending = lendingRepository.save(lending);
        return ResponseEntity.ok(convertToDTO(savedLending));
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public List<BookLendingDTO> getOverdueBooks() {
        return lendingRepository.findOverdueBooks(LocalDateTime.now()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private BookLendingDTO convertToDTO(BookLending lending) {
        BookLendingDTO dto = new BookLendingDTO();
        dto.setId(lending.getId());
        dto.setBookId(lending.getBook().getId());
        dto.setUserId(lending.getUser().getId());
        dto.setBorrowDate(lending.getBorrowDate());
        dto.setDueDate(lending.getDueDate());
        dto.setReturnDate(lending.getReturnDate());
        dto.setStatus(lending.getStatus());
        return dto;
    }
}
