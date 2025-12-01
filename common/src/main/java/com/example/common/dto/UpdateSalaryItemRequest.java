package com.example.common.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 更新薪酬项目请求DTO
 */
@Data
public class UpdateSalaryItemRequest {
    /**
     * 项目名称
     */
    @Size(max = 100, message = "项目名称长度不能超过100个字符")
    private String itemName;

    /**
     * 计算规则（如：基本工资*8%），为空表示手动输入
     */
    @Size(max = 500, message = "计算规则长度不能超过500个字符")
    private String calculationRule;

    /**
     * 排序顺序
     */
    private Integer sortOrder;
}

