package com.facebeat.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class StorageService {

    @Value("${storage.location}/images")
    private String imageUploadPath;

    @Value("${storage.location}/songs")
    private String songUploadPath;

    public String store(MultipartFile file, String type) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String storedFilename = UUID.randomUUID().toString() + extension;

        Path destinationPath;
        String subPath;

        if ("image".equals(type)) {
            destinationPath = Paths.get(imageUploadPath);
            subPath = "/images/";
        } else if ("song".equals(type)) {
            destinationPath = Paths.get(songUploadPath);
            subPath = "/songs/";
        } else {
            throw new IllegalArgumentException("Invalid file type specified.");
        }

        try {
            if (!Files.exists(destinationPath)) {
                Files.createDirectories(destinationPath);
            }
            try (InputStream inputStream = file.getInputStream()) {
                Path destinationFile = destinationPath.resolve(storedFilename);
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }
            return subPath + storedFilename; // DB에 저장될 경로
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }

    public void delete(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return;
        }
        try {
            // filePath는 /images/file.png 와 같은 형태이므로 앞의 /를 제거해야 함
            String cleanPath = filePath.startsWith("/") ? filePath.substring(1) : filePath;
            Path fileToDelete = Paths.get("src/main/resources/static").resolve(cleanPath);
            Files.deleteIfExists(fileToDelete);
        } catch (IOException e) {
            // 파일 삭제 실패 시 로깅만 하고 에러를 던지지 않을 수 있음 (선택)
            System.err.println("Failed to delete file: " + filePath);
        }
    }
}
