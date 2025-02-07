package com.library.controller;

import com.library.dto.analytics.LibraryStats;
import com.library.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN') or hasRole('LIBRARIAN')")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/stats")
    public LibraryStats getLibraryStats() {
        return analyticsService.getLibraryStats();
    }
}
