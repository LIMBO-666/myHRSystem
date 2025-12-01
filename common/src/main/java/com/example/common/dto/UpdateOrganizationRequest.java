package com.example.common.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 更新机构请求DTO
 */
@Data
public class UpdateOrganizationRequest {
    /**
     * 机构名称
     */
    @Size(max = 100, message = "机构名称长度不能超过100个字符")
    private String orgName;

    /**
     * 描述
     */
    @Size(max = 500, message = "描述长度不能超过500个字符")
    private String description;
}

