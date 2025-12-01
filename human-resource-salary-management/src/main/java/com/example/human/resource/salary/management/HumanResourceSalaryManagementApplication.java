package com.example.human.resource.salary.management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 人力资源薪酬管理模块主应用类
 */
@SpringBootApplication(scanBasePackages = {
        "com.example.human.resource.salary.management",
        "com.example.storage",
        "com.example.common"
})
public class HumanResourceSalaryManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(HumanResourceSalaryManagementApplication.class, args);
    }
}

