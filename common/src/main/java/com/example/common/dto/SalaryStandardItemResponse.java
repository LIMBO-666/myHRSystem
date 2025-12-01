package com.example.common.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 薪酬标准项目明细响应DTO
 */
@Data
public class SalaryStandardItemResponse {
    /**
     * 薪酬标准明细ID
     */
    private Long standardItemId;

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
     * 金额（保留两位小数）
     */
    private BigDecimal amount;

    /**
     * 是否根据计算规则计算：true(自动计算), false(手动输入)
     */
    private Boolean isCalculated;

    /**
     * 计算规则（如：基本工资*8%），为空表示手动输入
     */
    private String calculationRule;
}

