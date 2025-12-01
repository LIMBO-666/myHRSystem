package com.example.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 创建薪酬项目请求DTO
 */
@Data
public class CreateSalaryItemRequest {
    /**
     * 项目编号（如：S001）
     */
    @NotBlank(message = "项目编号不能为空")
    @Size(max = 20, message = "项目编号长度不能超过20个字符")
    private String itemCode;

    /**
     * 项目名称（如：基本工资、绩效奖金等）
     */
    @NotBlank(message = "项目名称不能为空")
    @Size(max = 100, message = "项目名称长度不能超过100个字符")
    private String itemName;

    /**
     * 项目类型：INCOME(收入项), DEDUCTION(扣除项)
     */
    @NotBlank(message = "项目类型不能为空")
    private String itemType;

    /**
     * 计算规则（如：基本工资*8%），为空表示手动输入
     */
    @Size(max = 500, message = "计算规则长度不能超过500个字符")
    private String calculationRule;

    /**
     * 排序顺序
     */
    @NotNull(message = "排序顺序不能为空")
    private Integer sortOrder;
}

