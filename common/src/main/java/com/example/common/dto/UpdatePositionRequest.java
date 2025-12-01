package com.example.common.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 更新职位请求DTO
 */
@Data
public class UpdatePositionRequest {
    /**
     * 职位名称
     */
    @Size(max = 100, message = "职位名称长度不能超过100个字符")
    private String positionName;

    /**
     * 职位描述
     */
    @Size(max = 500, message = "职位描述长度不能超过500个字符")
    private String description;
}

