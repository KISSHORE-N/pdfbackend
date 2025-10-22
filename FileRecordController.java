package com.scb.rwtoolbackend.controller;

import com.scb.rwtoolbackend.dto.FileRecordDto; 
import com.scb.rwtoolbackend.model.FileRecord;
import com.scb.rwtoolbackend.service.FileDistributorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; // Added for file handling

import java.util.List;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:3000")
public class FileRecordController {

    @Autowired
    private FileDistributorService routingService;

    /**
     * Uploads a file, its destination folder, and initial status.
     * Consumes multipart/form-data.
     */
    @PostMapping
    public ResponseEntity<String> uploadFile(
        @RequestParam("file") MultipartFile file, // The actual file content
        @RequestParam("destinationFolder") String destinationFolder, // Metadata from the form/request
        @RequestParam("status") String status // Metadata from the form/request
    ) {
        // We pass the file content and metadata directly to the service
        routingService.saveFile(file, destinationFolder, status);
        return ResponseEntity.ok("file routed successfully");
    }

    @GetMapping
    public List<FileRecord> getAllFiles() {
        return routingService.getAllFileRecords();
    }

    @PostMapping("/transfer/{id}")
    public ResponseEntity<String> transferFile(@PathVariable Long id) {
        routingService.transferFile(id);
        return ResponseEntity.ok("file transferred successfully");
    }
}
