package com.example.common.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 员工档案响应DTO
 */
@Data
public class EmployeeArchiveResponse {
    /**
     * 档案ID
     */
    private Long archiveId;

    /**
     * 档案编号
     */
    private String archiveNumber;

    /**
     * 姓名
     */
    private String name;

    /**
     * 性别
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
     * 个人履历
     */
    private String personalResume;

    /**
     * 家庭关系信息
     */
    private String familyRelationship;

    /**
     * 备注
     */
    private String remarks;

    /**
     * 照片URL
     */
    private String photoUrl;

    /**
     * 一级机构ID
     */
    private Long firstOrgId;

    /**
     * 一级机构名称
     */
    private String firstOrgName;

    /**
     * 二级机构ID
     */
    private Long secondOrgId;

    /**
     * 二级机构名称
     */
    private String secondOrgName;

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
     * 职位ID
     */
    private Long positionId;

    /**
     * 职位名称
     */
    private String positionName;

    /**
     * 职称
     */
    private String jobTitle;

    /**
     * 薪酬标准ID
     */
    private Long salaryStandardId;

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
     * 复核意见
     */
    private String reviewComments;

    /**
     * 状态
     */
    private String status;

    /**
     * 删除时间
     */
    private LocalDateTime deleteTime;

    /**
     * 删除原因
     */
    private String deleteReason;
}

