package com.example.common.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 职位响应DTO
 */
@Data
public class PositionResponse {
    /**
     * 职位ID
     */
    private Long positionId;

    /**
     * 职位名称
     */
    private String positionName;

    /**
     * 所属三级机构ID
     */
    private Long thirdOrgId;

    /**
     * 三级机构名称
     */
    private String thirdOrgName;

    /**
     * 机构全路径（一级机构/二级机构/三级机构）
     */
    private String orgFullPath;

    /**
     * 职位描述
     */
    private String description;

    /**
     * 状态：ACTIVE(激活), INACTIVE(禁用)
     */
    private String status;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}

