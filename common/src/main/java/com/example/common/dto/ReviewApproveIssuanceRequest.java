package com.example.common.dto;

import jakarta.validation.Valid;
import lombok.Data;

import java.util.List;

/**
 * 复核通过薪酬发放单请求DTO
 * 可以修改奖励金额和应扣金额
 */
@Data
public class ReviewApproveIssuanceRequest {
    /**
     * 薪酬发放明细列表（可修改奖励金额和应扣金额）
     */
    @Valid
    private List<SalaryIssuanceDetailUpdateRequest> details;
}

