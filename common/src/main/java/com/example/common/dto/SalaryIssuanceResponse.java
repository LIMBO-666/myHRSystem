package com.example.common.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 薪酬发放单响应DTO
 */
@Data
public class SalaryIssuanceResponse {
    /**
     * 薪酬发放单ID
     */
    private Long issuanceId;

    /**
     * 薪酬单号（如：PAY202307001）
     */
    private String salarySlipNumber;

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
    private java.math.BigDecimal totalBasicSalary;

    /**
     * 实发薪酬总额
     */
    private java.math.BigDecimal totalNetPay;

    /**
     * 发放月份
     */
    private LocalDate issuanceMonth;

    /**
     * 实际发放时间（财务系统付款日期）
     */
    private LocalDate issuanceTime;

    /**
     * 登记人ID
     */
    private Long registrarId;

    /**
     * 登记人姓名
     */
    private String registrarName;

    /**
     * 登记时间
     */
    private LocalDateTime registrationTime;

    /**
     * 复核人ID
     */
    private Long reviewerId;

    /**
     * 复核人姓名
     */
    private String reviewerName;

    /**
     * 复核时间
     */
    private LocalDateTime reviewTime;

    /**
     * 驳回原因
     */
    private String rejectReason;

    /**
     * 状态：PENDING_REGISTRATION(待登记), PENDING_REVIEW(待复核), EXECUTED(执行), PAID(已付款), REJECTED(已驳回)
     */
    private String status;

    /**
     * 付款状态（由财务系统更新）：PENDING(待付款), PAID(已付款)
     */
    private String paymentStatus;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

    /**
     * 薪酬发放明细列表
     */
    private List<SalaryIssuanceDetailResponse> details;
}

