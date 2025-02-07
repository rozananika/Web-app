package com.library.controller;

import com.library.service.ExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/export")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ExportController {

    @Autowired
    private ExportService exportService;

    @GetMapping("/lending-history")
    public ResponseEntity<byte[]> exportLendingHistory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            byte[] report = exportService.exportLendingHistory(startDate, endDate);
            return createExcelResponse(report, "lending_history.xlsx");
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<byte[]> exportAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            byte[] report = exportService.exportAnalyticsReport(startDate, endDate);
            return createExcelResponse(report, "analytics_report.xlsx");
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private ResponseEntity<byte[]> createExcelResponse(byte[] content, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", filename);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(content);
    }
}
