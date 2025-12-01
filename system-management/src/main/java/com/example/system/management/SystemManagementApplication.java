package com.example.system.management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 系统管理模块主应用类
 */
@SpringBootApplication(scanBasePackages = {
        "com.example.system.management",
        "com.example.storage",
        "com.example.common"
})
public class SystemManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(SystemManagementApplication.class, args);
    }
}

