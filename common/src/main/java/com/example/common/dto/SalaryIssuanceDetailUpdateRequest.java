package com.example.common.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 薪酬发放明细更新请求DTO（用于复核时修改）
 */
@Data
public class SalaryIssuanceDetailUpdateRequest {
    /**
     * 薪酬发放明细ID
     */
    @NotNull(message = "薪酬发放明细ID不能为空")
    private Long detailId;

    /**
     * 奖励金额
     */
    private BigDecimal awardAmount;

    /**
     * 应扣金额
     */
    private BigDecimal deductionAmount;
}

