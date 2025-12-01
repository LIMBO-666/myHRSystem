package com.example.storage.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * 文件存储服务接口
 */
public interface FileStorageService {
    /**
     * 保存文件并返回文件访问URL
     *
     * @param file 上传的文件
     * @param subPath 子路径（例如：photos）
     * @param fileName 文件名（如果为null，则使用原始文件名）
     * @return 文件访问URL
     */
    String saveFile(MultipartFile file, String subPath, String fileName);

    /**
     * 删除文件
     *
     * @param fileUrl 文件URL
     * @return 是否删除成功
     */
    boolean deleteFile(String fileUrl);
}

