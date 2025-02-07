package com.library.controller;

import com.library.dto.BookDTO;
import com.library.model.Author;
import com.library.model.Book;
import com.library.repository.AuthorRepository;
import com.library.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BookController {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @GetMapping
    public List<BookDTO> getAllBooks() {
        return bookRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookDTO> getBookById(@PathVariable Long id) {
        return bookRepository.findById(id)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<BookDTO> createBook(@Valid @RequestBody BookDTO bookDTO) {
        Book book = convertToEntity(bookDTO);
        Book savedBook = bookRepository.save(book);
        return ResponseEntity.ok(convertToDTO(savedBook));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<BookDTO> updateBook(@PathVariable Long id, @Valid @RequestBody BookDTO bookDTO) {
        if (!bookRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        Book book = convertToEntity(bookDTO);
        book.setId(id);
        Book updatedBook = bookRepository.save(book);
        return ResponseEntity.ok(convertToDTO(updatedBook));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        if (!bookRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        bookRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public List<BookDTO> searchBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String isbn) {
        
        List<Book> books;
        if (title != null && !title.isEmpty()) {
            books = bookRepository.findByTitleContainingIgnoreCase(title);
        } else if (genre != null && !genre.isEmpty()) {
            books = bookRepository.findByGenre(genre);
        } else if (isbn != null && !isbn.isEmpty()) {
            return bookRepository.findByIsbn(isbn)
                    .map(this::convertToDTO)
                    .map(List::of)
                    .orElse(List.of());
        } else {
            books = bookRepository.findAll();
        }
        
        return books.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/available")
    public List<BookDTO> getAvailableBooks() {
        return bookRepository.findAvailableBooks().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private BookDTO convertToDTO(Book book) {
        BookDTO dto = new BookDTO();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setIsbn(book.getIsbn());
        dto.setSummary(book.getSummary());
        dto.setPublicationDate(book.getPublicationDate());
        dto.setGenre(book.getGenre());
        dto.setCoverImageUrl(book.getCoverImageUrl());
        dto.setTotalCopies(book.getTotalCopies());
        dto.setAvailableCopies(book.getAvailableCopies());
        dto.setAuthorIds(book.getAuthors().stream()
                .map(Author::getId)
                .collect(Collectors.toSet()));
        return dto;
    }

    private Book convertToEntity(BookDTO dto) {
        Book book = new Book();
        book.setId(dto.getId());
        book.setTitle(dto.getTitle());
        book.setIsbn(dto.getIsbn());
        book.setSummary(dto.getSummary());
        book.setPublicationDate(dto.getPublicationDate());
        book.setGenre(dto.getGenre());
        book.setCoverImageUrl(dto.getCoverImageUrl());
        book.setTotalCopies(dto.getTotalCopies());
        book.setAvailableCopies(dto.getAvailableCopies());
        
        if (dto.getAuthorIds() != null) {
            Set<Author> authors = dto.getAuthorIds().stream()
                    .map(id -> authorRepository.findById(id)
                            .orElseThrow(() -> new RuntimeException("Author not found with id: " + id)))
                    .collect(Collectors.toSet());
            book.setAuthors(authors);
        }
        
        return book;
    }
}
