package com.scb.rwtoolbackend.model;

import jakarta.persistence.*;
// Necessary import for Large Object storage
import org.hibernate.annotations.Type; 

@Entity
@Table(name = "file_records")
public class FileRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fileName;
    private String destinationFolder;
    private String status;
    
    // New field to store the actual file content as binary data (BLOB)
    @Lob // Indicates this field should be treated as a Large Object
    @Column(name = "file_content", columnDefinition="LONGBLOB") // Use LONGBLOB for large files
    private byte[] fileContent; 

    // Getters and Setters for all fields

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

    public String getDestinationFolder() {
        return destinationFolder;
    }

    public void setDestinationFolder(String destinationFolder) {
        this.destinationFolder = destinationFolder;
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
