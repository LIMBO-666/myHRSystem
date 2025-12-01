package com.example.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 创建职位请求DTO
 */
@Data
public class CreatePositionRequest {
    /**
     * 职位名称
     */
    @NotBlank(message = "职位名称不能为空")
    @Size(max = 100, message = "职位名称长度不能超过100个字符")
    private String positionName;

    /**
     * 所属三级机构ID
     */
    @NotNull(message = "所属三级机构ID不能为空")
    private Long thirdOrgId;

    /**
     * 职位描述
     */
    @Size(max = 500, message = "职位描述长度不能超过500个字符")
    private String description;
}

