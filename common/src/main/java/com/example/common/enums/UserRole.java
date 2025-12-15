package com.example.common.enums;

import lombok.Getter;

/**
 * 用户角色枚举
 */
@Getter
public enum UserRole {
    /**
     * 系统管理员
     */
    SYSTEM_ADMIN("SYSTEM_ADMIN", "系统管理员"),

    /**
     * 人事专员
     */
    HR_SPECIALIST("HR_SPECIALIST", "人事专员"),

    /**
     * 人事经理
     */
    HR_MANAGER("HR_MANAGER", "人事经理"),

    /**
     * 薪酬专员
     */
    SALARY_SPECIALIST("SALARY_SPECIALIST", "薪酬专员"),

    /**
     * 薪酬经理
     */
    SALARY_MANAGER("SALARY_MANAGER", "薪酬经理");

    private final String code;
    private final String description;

    UserRole(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public static UserRole fromCode(String code) {
        for (UserRole role : values()) {
            if (role.code.equals(code)) {
                return role;
            }
        }
        return null;
    }
}

