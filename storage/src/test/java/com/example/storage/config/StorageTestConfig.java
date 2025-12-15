package com.example.storage.config;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

/**
 * Storage模块测试配置类
 */
@Configuration
@EnableAutoConfiguration
@ComponentScan(basePackages = "com.example.storage")
@Import(MyBatisPlusConfig.class)
public class StorageTestConfig {
}
