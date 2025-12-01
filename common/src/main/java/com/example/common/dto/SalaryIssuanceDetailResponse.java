package com.example.common.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 薪酬发放明细响应DTO
 */
@Data
public class SalaryIssuanceDetailResponse {
    /**
     * 薪酬发放明细ID
     */
    private Long detailId;

    /**
     * 员工档案ID
     */
    private Long employeeId;

    /**
     * 员工编号
     */
    private String employeeNumber;

    /**
     * 员工姓名
     */
    private String employeeName;

    /**
     * 职位名称
     */
    private String positionName;

    // ========== 薪酬明细（收入项） ==========
    /**
     * 基本工资
     */
    private BigDecimal basicSalary;

    /**
     * 绩效奖金
     */
    private BigDecimal performanceBonus;

    /**
     * 交通补贴
     */
    private BigDecimal transportationAllowance;

    /**
     * 餐费补贴
     */
    private BigDecimal mealAllowance;

    // ========== 薪酬明细（扣除项） ==========
    /**
     * 养老保险
     */
    private BigDecimal pensionInsurance;

    /**
     * 医疗保险
     */
    private BigDecimal medicalInsurance;

    /**
     * 失业保险
     */
    private BigDecimal unemploymentInsurance;

    /**
     * 住房公积金
     */
    private BigDecimal housingFund;

    // ========== 其他可调整项 ==========
    /**
     * 奖励金额
     */
    private BigDecimal awardAmount;

    /**
     * 应扣金额
     */
    private BigDecimal deductionAmount;

    // ========== 合计 ==========
    /**
     * 总收入
     */
    private BigDecimal totalIncome;

    /**
     * 总扣除
     */
    private BigDecimal totalDeduction;

    /**
     * 实发金额
     */
    private BigDecimal netPay;
}

