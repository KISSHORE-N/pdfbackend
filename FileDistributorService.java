package com.scb.rwtoolbackend.service;

import com.scb.rwtoolbackend.model.ComplianceFile;
import com.scb.rwtoolbackend.model.FileRecord;
import com.scb.rwtoolbackend.model.FinanceFile;
import com.scb.rwtoolbackend.model.OpsFile;
import com.scb.rwtoolbackend.repository.ComplianceFileRepository;
import com.scb.rwtoolbackend.repository.FileRecordRepository;
import com.scb.rwtoolbackend.repository.FinanceFileRepository;
import com.scb.rwtoolbackend.repository.OpsFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile; // Added for file handling

import java.io.IOException;
import java.util.List;

// FileRecordDto is no longer directly used in the save method, but we keep the imports/context
// of the other classes.

@Service
public class FileDistributorService {

    @Autowired
    private OpsFileRepository opsRepo;

    @Autowired
    private FileRecordRepository fileRecordRepo;

    @Autowired
    private FinanceFileRepository financeRepo;

    @Autowired
    private ComplianceFileRepository complianceRepo;

    /**
     * Saves the MultipartFile content and metadata into the FileRecord table.
     * @param file The uploaded MultipartFile (the PDF content).
     * @param destinationFolder The intended destination folder string.
     * @param status The initial status string.
     */
    public void saveFile(MultipartFile file, String destinationFolder, String status) {
        if (file.isEmpty()) {
            throw new RuntimeException("Cannot save an empty file.");
        }
        
        try {
            FileRecord f = new FileRecord();
            // Set file content from the MultipartFile
            f.setFileContent(file.getBytes()); 
            
            // Set metadata
            f.setFileName(file.getOriginalFilename());
            f.setDestinationFolder(destinationFolder);
            f.setStatus(status);
            
            fileRecordRepo.save(f);
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file content for saving.", e);
        }
    }

    public List<FileRecord> getAllFileRecords() {
        return fileRecordRepo.findAll();
    }

    /**
     * Transfers the file (metadata AND content) to the correct destination table
     * based on the destination folder name in the record.
     * @param id The ID of the record to transfer.
     */
    public void transferFile(Long id) {
        FileRecord file = fileRecordRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));

        String folder = file.getDestinationFolder().toLowerCase();
        
        // Retrieve the file content once
        byte[] content = file.getFileContent();

        if (folder.contains("ops")) {
            OpsFile f = new OpsFile();
            f.setFileName(file.getFileName());
            f.setDestinationFolder(file.getDestinationFolder());
            f.setStatus(file.getStatus());
            f.setFileContent(content); // COPY THE FILE CONTENT
            opsRepo.save(f);
        } else if (folder.contains("finance")) {
            FinanceFile f = new FinanceFile();
            f.setFileName(file.getFileName());
            f.setDestinationFolder(file.getDestinationFolder());
            f.setStatus(file.getStatus());
            f.setFileContent(content); // COPY THE FILE CONTENT
            financeRepo.save(f);
        } else if (folder.contains("compliance")) {
            ComplianceFile f = new ComplianceFile();
            f.setFileName(file.getFileName());
            f.setDestinationFolder(file.getDestinationFolder());
            f.setStatus(file.getStatus());
            f.setFileContent(content); // COPY THE FILE CONTENT
            complianceRepo.save(f);
        }
        
        // Delete the original record after successful transfer
        fileRecordRepo.deleteById(id);
    }
}
