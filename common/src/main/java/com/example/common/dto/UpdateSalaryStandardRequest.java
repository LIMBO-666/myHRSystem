package com.example.common.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/**
 * 更新薪酬标准请求DTO
 */
@Data
public class UpdateSalaryStandardRequest {
    /**
     * 薪酬标准名称（如：前端工程师-中级标准）
     */
    @Size(max = 200, message = "薪酬标准名称长度不能超过200个字符")
    private String standardName;

    /**
     * 薪酬项目明细列表
     */
    @Valid
    private List<SalaryStandardItemRequest> items;
}

