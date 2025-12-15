package com.example.storage.service.Impl;

import com.example.storage.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
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
            
            // 如果是照片文件，保存到 storage/src/main/resources/photofile 目录
            Path directory;
            if ("photos".equals(subPath)) {
                // 获取项目根目录
                String projectRoot = getProjectRoot();
                // 构建照片保存路径：storage/src/main/resources/photofile
                directory = Paths.get(projectRoot, "storage", "src", "main", "resources", "photofile");
                
                // 添加日志输出，便于调试
                System.out.println("照片保存路径 - 项目根目录: " + projectRoot);
                System.out.println("照片保存路径 - 完整路径: " + directory.toAbsolutePath().toString());
            } else {
                // 其他文件使用默认路径
                directory = Paths.get(uploadPath, subPath);
            }
            
            // 创建目录（如果不存在）
            if (!Files.exists(directory)) {
                Files.createDirectories(directory);
                System.out.println("创建照片目录: " + directory.toAbsolutePath().toString());
            }

            // 保存文件
            Path filePath = directory.resolve(finalFileName);
            System.out.println("保存照片文件: " + filePath.toAbsolutePath().toString());
            Files.write(filePath, file.getBytes());
            System.out.println("照片文件保存成功，文件大小: " + Files.size(filePath) + " 字节");

            // 返回文件访问URL
            // 对于照片文件，返回相对路径或完整路径
            if ("photos".equals(subPath)) {
                // 返回相对路径，便于前端访问
                return "/photofile/" + finalFileName;
            } else {
                return urlPrefix + "/" + subPath + "/" + finalFileName;
            }
        } catch (IOException e) {
            throw new RuntimeException("文件保存失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 获取项目根目录
     * 通过查找 storage 模块的路径来确定项目根目录
     */
    private String getProjectRoot() {
        try {
            // 方法1: 从类路径查找
            try {
                String classPath = this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath();
                // 处理URL编码（如空格会被编码为%20）
                if (classPath.contains("%20")) {
                    classPath = java.net.URLDecoder.decode(classPath, "UTF-8");
                }
                
                File currentFile = new File(classPath);
                
                // 查找包含 storage 目录的路径
                File current = currentFile;
                int maxDepth = 10; // 防止无限循环
                int depth = 0;
                while (current != null && depth < maxDepth) {
                    File parent = current.getParentFile();
                    if (parent != null) {
                        File storageDir = new File(parent, "storage");
                        if (storageDir.exists() && storageDir.isDirectory()) {
                            return parent.getAbsolutePath();
                        }
                    }
                    current = parent;
                    depth++;
                }
            } catch (Exception e) {
                // 忽略异常，尝试其他方法
            }
            
            // 方法2: 使用当前工作目录
            String userDir = System.getProperty("user.dir");
            File storageDir = new File(userDir, "storage");
            if (storageDir.exists() && storageDir.isDirectory()) {
                return userDir;
            }
            
            // 方法3: 尝试从环境变量或系统属性获取
            String projectHome = System.getProperty("project.home");
            if (projectHome != null && !projectHome.isEmpty()) {
                File projectHomeDir = new File(projectHome);
                if (projectHomeDir.exists() && new File(projectHomeDir, "storage").exists()) {
                    return projectHomeDir.getAbsolutePath();
                }
            }
            
            // 方法4: 使用相对路径（相对于当前工作目录）
            File relativePath = new File(".").getCanonicalFile();
            File storageDirRelative = new File(relativePath, "storage");
            if (storageDirRelative.exists() && storageDirRelative.isDirectory()) {
                return relativePath.getAbsolutePath();
            }
            
            // 如果所有方法都失败，使用当前工作目录
            return userDir;
        } catch (Exception e) {
            // 如果所有方法都失败，使用当前工作目录
            return System.getProperty("user.dir");
        }
    }

    @Override
    public boolean deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return false;
        }

        try {
            Path filePath;
            
            // 判断是否是照片文件（以 /photofile/ 开头）
            if (fileUrl.startsWith("/photofile/")) {
                // 从URL中提取文件名
                String fileName = fileUrl.replace("/photofile/", "");
                // 构建照片文件路径
                String projectRoot = getProjectRoot();
                filePath = Paths.get(projectRoot, "storage", "src", "main", "resources", "photofile", fileName);
            } else {
                // 其他文件使用原来的逻辑
                String relativePath = fileUrl.replace(urlPrefix + "/", "");
                filePath = Paths.get(uploadPath, relativePath);
            }

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

