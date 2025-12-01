package com.example.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * 创建员工档案请求DTO
 */
@Data
public class CreateEmployeeArchiveRequest {
    /**
     * 姓名
     */
    @NotBlank(message = "姓名不能为空")
    private String name;

    /**
     * 性别：MALE(男), FEMALE(女)
     */
    private String gender;

    /**
     * 身份证号码
     */
    private String idNumber;

    /**
     * 出生日期
     */
    private LocalDate birthday;

    /**
     * 年龄
     */
    private Integer age;

    /**
     * 国籍
     */
    private String nationality;

    /**
     * 出生地
     */
    private String placeOfBirth;

    /**
     * 民族
     */
    private String ethnicity;

    /**
     * 宗教信仰
     */
    private String religiousBelief;

    /**
     * 政治面貌
     */
    private String politicalStatus;

    /**
     * 学历
     */
    private String educationLevel;

    /**
     * 学历专业
     */
    private String major;

    /**
     * Email
     */
    private String email;

    /**
     * 电话
     */
    private String phone;

    /**
     * QQ
     */
    private String qq;

    /**
     * 手机
     */
    private String mobile;

    /**
     * 住址
     */
    private String address;

    /**
     * 邮编
     */
    private String postalCode;

    /**
     * 爱好
     */
    private String hobby;

    /**
     * 个人履历（大段文本）
     */
    private String personalResume;

    /**
     * 家庭关系信息（大段文本）
     */
    private String familyRelationship;

    /**
     * 备注（大段文本）
     */
    private String remarks;

    /**
     * 一级机构ID
     */
    @NotNull(message = "一级机构ID不能为空")
    private Long firstOrgId;

    /**
     * 二级机构ID
     */
    @NotNull(message = "二级机构ID不能为空")
    private Long secondOrgId;

    /**
     * 三级机构ID
     */
    @NotNull(message = "三级机构ID不能为空")
    private Long thirdOrgId;

    /**
     * 职位ID
     */
    @NotNull(message = "职位ID不能为空")
    private Long positionId;

    /**
     * 职称：JUNIOR(初级), INTERMEDIATE(中级), SENIOR(高级)
     */
    @NotBlank(message = "职称不能为空")
    private String jobTitle;

    /**
     * 薪酬标准ID
     */
    private Long salaryStandardId;

    /**
     * 照片URL
     */
    private String photoUrl;
}

