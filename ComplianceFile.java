package com.scb.rwtoolbackend.model;

import jakarta.persistence.*;
// Necessary import for Large Object storage
import org.hibernate.annotations.Type; 

@Entity
@Table(name = "compliance_files")
public class ComplianceFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fileName;
    private String destinationFolder;
    private String status;
    
    // New field to store the actual file content
    @Lob 
    @Column(name = "file_content", columnDefinition="LONGBLOB") 
    private byte[] fileContent;

    // Getters and Setters for all fields

    public String getDestinationFolder() {
        return destinationFolder;
    }

    public void setDestinationFolder(String destinationFolder) {
        this.destinationFolder = destinationFolder;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public byte[] getFileContent() {
        return fileContent;
    }

    public void setFileContent(byte[] fileContent) {
        this.fileContent = fileContent;
    }
}
