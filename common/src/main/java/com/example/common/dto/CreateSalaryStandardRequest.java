package com.example.common.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/**
 * 创建薪酬标准请求DTO
 */
@Data
public class CreateSalaryStandardRequest {
    /**
     * 薪酬标准名称（如：前端工程师-中级标准）
     */
    @NotBlank(message = "薪酬标准名称不能为空")
    @Size(max = 200, message = "薪酬标准名称长度不能超过200个字符")
    private String standardName;

    /**
     * 适用职位ID
     */
    @NotNull(message = "职位ID不能为空")
    private Long positionId;

    /**
     * 职称：JUNIOR(初级), INTERMEDIATE(中级), SENIOR(高级)
     */
    @NotBlank(message = "职称不能为空")
    private String jobTitle;

    /**
     * 制定人ID
     */
    @NotNull(message = "制定人ID不能为空")
    private Long formulatorId;

    /**
     * 登记人ID（可选，默认为当前登录用户）
     */
    private Long registrarId;

    /**
     * 薪酬项目明细列表
     */
    @Valid
    private List<SalaryStandardItemRequest> items;
}

