package com.library.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class BookDTO {
    private Long id;
    private String title;
    private String isbn;
    private String summary;
    private LocalDateTime publicationDate;
    private String genre;
    private String coverImageUrl;
    private Integer totalCopies;
    private Integer availableCopies;
    private Set<Long> authorIds;
}
