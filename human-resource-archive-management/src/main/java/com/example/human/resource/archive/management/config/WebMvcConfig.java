package com.example.human.resource.archive.management.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.nio.file.Paths;

/**
 * Web MVC 配置类
 * 用于配置静态资源访问和CORS
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload.path:./uploads}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 配置静态资源访问路径
        // 访问 /uploads/** 时，映射到本地文件系统的 uploads 目录
        String uploadDir = Paths.get(uploadPath).toAbsolutePath().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");
        
        // 配置照片文件访问路径
        // 访问 /photofile/** 时，映射到 storage/src/main/resources/photofile 目录
        String projectRoot = getProjectRoot();
        String photoDir = Paths.get(projectRoot, "storage", "src", "main", "resources", "photofile").toString();
        registry.addResourceHandler("/photofile/**")
                .addResourceLocations("file:" + photoDir + "/");
    }
    
    /**
     * 获取项目根目录
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
                int maxDepth = 10;
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
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}

