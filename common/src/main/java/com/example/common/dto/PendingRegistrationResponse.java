package com.example.common.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 待登记薪酬发放单响应DTO（按三级机构分组）
 */
@Data
public class PendingRegistrationResponse {
    /**
     * 三级机构ID
     */
    private Long thirdOrgId;

    /**
     * 三级机构名称
     */
    private String thirdOrgName;

    /**
     * 机构全路径
     */
    private String orgFullPath;

    /**
     * 总人数
     */
    private Integer totalEmployees;

    /**
     * 基本薪酬总额
     */
    private BigDecimal totalBasicSalary;

    /**
     * 薪酬单号（如果已登记）
     */
    private String salarySlipNumber;

    /**
     * 状态：PENDING_REGISTRATION(待登记), PENDING_REVIEW(待复核)
     */
    private String status;
}

