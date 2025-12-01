package com.example.storage.service.Impl;

import com.example.storage.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * 文件存储服务实现类
 */
@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${file.upload.path:./uploads}")
    private String uploadPath;

    @Value("${file.upload.url-prefix:http://localhost:8080/uploads}")
    private String urlPrefix;

    @Override
    public String saveFile(MultipartFile file, String subPath, String fileName) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("文件不能为空");
        }

        // 验证文件类型（只允许图片）
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new RuntimeException("文件名不能为空");
        }

        String extension = getFileExtension(originalFilename);
        if (!isImageFile(extension)) {
            throw new RuntimeException("只允许上传图片文件（jpg, jpeg, png, gif）");
        }

        // 验证文件大小（限制为5MB）
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("文件大小不能超过5MB");
        }

        try {
            // 构建保存路径
            String finalFileName;
            if (fileName != null && !fileName.isEmpty()) {
                // 如果提供了文件名，使用提供的文件名
                finalFileName = fileName;
                // 确保文件名有扩展名
                if (!finalFileName.contains(".")) {
                    // 使用已定义的 extension 变量
                    if (!extension.isEmpty()) {
                        finalFileName = finalFileName + "." + extension;
                    }
                }
            } else {
                // 否则生成文件名
                finalFileName = generateFileName(originalFilename);
            }
            
            Path directory = Paths.get(uploadPath, subPath);
            
            // 创建目录（如果不存在）
            if (!Files.exists(directory)) {
                Files.createDirectories(directory);
            }

            // 保存文件
            Path filePath = directory.resolve(finalFileName);
            Files.write(filePath, file.getBytes());

            // 返回文件访问URL
            return urlPrefix + "/" + subPath + "/" + finalFileName;
        } catch (IOException e) {
            throw new RuntimeException("文件保存失败: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return false;
        }

        try {
            // 从URL中提取文件路径
            String relativePath = fileUrl.replace(urlPrefix + "/", "");
            Path filePath = Paths.get(uploadPath, relativePath);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                return true;
            }
            return false;
        } catch (IOException e) {
            throw new RuntimeException("文件删除失败: " + e.getMessage(), e);
        }
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < filename.length() - 1) {
            return filename.substring(lastDotIndex + 1).toLowerCase();
        }
        return "";
    }

    /**
     * 判断是否为图片文件
     */
    private boolean isImageFile(String extension) {
        return extension.equals("jpg") || extension.equals("jpeg") 
                || extension.equals("png") || extension.equals("gif");
    }

    /**
     * 生成文件名（使用UUID + 时间戳 + 原始扩展名）
     */
    private String generateFileName(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return timestamp + "_" + uuid + "." + extension;
    }
}

