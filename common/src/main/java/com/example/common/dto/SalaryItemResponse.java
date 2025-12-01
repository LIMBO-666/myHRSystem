package com.example.common.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 薪酬项目响应DTO
 */
@Data
public class SalaryItemResponse {
    /**
     * 薪酬项目ID
     */
    private Long itemId;

    /**
     * 项目编号（如：S001）
     */
    private String itemCode;

    /**
     * 项目名称（如：基本工资、绩效奖金等）
     */
    private String itemName;

    /**
     * 项目类型：INCOME(收入项), DEDUCTION(扣除项)
     */
    private String itemType;

    /**
     * 计算规则（如：基本工资*8%），为空表示手动输入
     */
    private String calculationRule;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 状态：ACTIVE(激活), INACTIVE(禁用)
     */
    private String status;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}

