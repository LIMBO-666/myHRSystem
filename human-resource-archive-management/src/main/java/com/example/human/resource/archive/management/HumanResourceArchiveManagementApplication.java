package com.example.human.resource.archive.management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 人力资源档案管理模块主应用类
 */
@SpringBootApplication(scanBasePackages = {
        "com.example.human.resource.archive.management",
        "com.example.storage",
        "com.example.common"
})
public class HumanResourceArchiveManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(HumanResourceArchiveManagementApplication.class, args);
    }
}

