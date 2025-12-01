package com.example.common.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 薪酬发放明细请求DTO
 */
@Data
public class SalaryIssuanceDetailRequest {
    /**
     * 员工档案ID
     */
    @NotNull(message = "员工档案ID不能为空")
    private Long employeeId;

    /**
     * 奖励金额
     */
    private BigDecimal awardAmount;

    /**
     * 应扣金额
     */
    private BigDecimal deductionAmount;
}

