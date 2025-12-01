package com.example.common.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 薪酬标准项目明细请求DTO
 */
@Data
public class SalaryStandardItemRequest {
    /**
     * 薪酬项目ID
     */
    @NotNull(message = "薪酬项目ID不能为空")
    private Long itemId;

    /**
     * 金额（保留两位小数）
     */
    private BigDecimal amount;

    /**
     * 是否根据计算规则计算：true(自动计算), false(手动输入)
     */
    private Boolean isCalculated;
}

