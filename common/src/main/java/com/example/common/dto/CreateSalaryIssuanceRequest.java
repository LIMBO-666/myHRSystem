package com.example.common.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * 创建薪酬发放单请求DTO
 */
@Data
public class CreateSalaryIssuanceRequest {
    /**
     * 三级机构ID
     */
    @NotNull(message = "三级机构ID不能为空")
    private Long thirdOrgId;

    /**
     * 发放月份，格式：yyyy-MM
     */
    @NotBlank(message = "发放月份不能为空")
    private String issuanceMonth;

    /**
     * 薪酬发放明细列表
     */
    @Valid
    private List<SalaryIssuanceDetailRequest> details;
}

