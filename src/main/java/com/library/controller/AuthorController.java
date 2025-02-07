package com.library.controller;

import com.library.dto.AuthorDTO;
import com.library.model.Author;
import com.library.repository.AuthorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/authors")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthorController {

    @Autowired
    private AuthorRepository authorRepository;

    @GetMapping
    public List<AuthorDTO> getAllAuthors() {
        return authorRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthorDTO> getAuthorById(@PathVariable Long id) {
        return authorRepository.findById(id)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<AuthorDTO> createAuthor(@Valid @RequestBody AuthorDTO authorDTO) {
        Author author = convertToEntity(authorDTO);
        Author savedAuthor = authorRepository.save(author);
        return ResponseEntity.ok(convertToDTO(savedAuthor));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
    public ResponseEntity<AuthorDTO> updateAuthor(@PathVariable Long id, @Valid @RequestBody AuthorDTO authorDTO) {
        if (!authorRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        Author author = convertToEntity(authorDTO);
        author.setId(id);
        Author updatedAuthor = authorRepository.save(author);
        return ResponseEntity.ok(convertToDTO(updatedAuthor));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAuthor(@PathVariable Long id) {
        if (!authorRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        authorRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public List<AuthorDTO> searchAuthors(@RequestParam String query) {
        return authorRepository.findByNameContainingIgnoreCase(query)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private AuthorDTO convertToDTO(Author author) {
        AuthorDTO dto = new AuthorDTO();
        dto.setId(author.getId());
        dto.setName(author.getName());
        dto.setBiography(author.getBiography());
        return dto;
    }

    private Author convertToEntity(AuthorDTO dto) {
        Author author = new Author();
        author.setId(dto.getId());
        author.setName(dto.getName());
        author.setBiography(dto.getBiography());
        return author;
    }
}
