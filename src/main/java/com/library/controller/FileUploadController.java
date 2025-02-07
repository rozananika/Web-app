package com.library.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FileUploadController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping("/image")
    public ResponseEntity<String> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) {
        try {
            // Create upload directory if it doesn't exist
            String typeDir = uploadDir + "/" + type;
            File directory = new File(typeDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Generate unique filename
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(typeDir, filename);

            // Save file
            Files.copy(file.getInputStream(), filePath);

            // Return the relative path to the file
            String relativePath = "/" + type + "/" + filename;
            return ResponseEntity.ok(relativePath);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to upload file: " + e.getMessage());
        }
    }
}
