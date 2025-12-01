package com.example.common.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 复核并修改请求DTO
 * 档案编号、所属机构和职位不能修改，其他信息均可修改
 */
@Data
public class ReviewWithUpdateRequest {
    /**
     * 姓名
     */
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
     * 职称：JUNIOR(初级), INTERMEDIATE(中级), SENIOR(高级)
     */
    private String jobTitle;

    /**
     * 薪酬标准ID
     */
    private Long salaryStandardId;

    /**
     * 照片URL
     */
    private String photoUrl;

    /**
     * 复核意见
     */
    private String reviewComments;

    /**
     * 是否通过（true表示通过，false表示驳回）
     */
    private Boolean approve;
}

