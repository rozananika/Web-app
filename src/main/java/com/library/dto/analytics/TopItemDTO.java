package com.library.dto.analytics;

import lombok.Data;

@Data
public class TopItemDTO {
    private Long id;
    private String name;
    private Long count;
    private Double rating;
    
    public TopItemDTO(Long id, String name, Long count) {
        this.id = id;
        this.name = name;
        this.count = count;
    }
    
    public TopItemDTO(Long id, String name, Double rating) {
        this.id = id;
        this.name = name;
        this.rating = rating;
    }
}
