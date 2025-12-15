package com.example.storage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Storage模块测试应用类
 * 用于支持集成测试
 */
@SpringBootApplication(scanBasePackages = "com.example.storage")
public class StorageTestApplication {
    public static void main(String[] args) {
        SpringApplication.run(StorageTestApplication.class, args);
    }
}
