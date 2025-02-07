package com.library.controller;

import com.library.service.PredictiveAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PredictiveAnalyticsController {

    @Autowired
    private PredictiveAnalyticsService predictiveAnalyticsService;

    @GetMapping("/predictions")
    public ResponseEntity<Map<String, Object>> getPredictions() {
        Map<String, Object> predictions = predictiveAnalyticsService.getPredictions();
        return ResponseEntity.ok(predictions);
    }
}
