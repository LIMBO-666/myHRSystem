package com.example.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 创建机构请求DTO
 */
@Data
public class CreateOrganizationRequest {
    /**
     * 机构名称
     */
    @NotBlank(message = "机构名称不能为空")
    @Size(max = 100, message = "机构名称长度不能超过100个字符")
    private String orgName;

    /**
     * 机构编号（用于生成档案编号）
     */
    @NotBlank(message = "机构编号不能为空")
    @Pattern(regexp = "^\\d{2}$", message = "机构编号必须是2位数字")
    private String orgCode;

    /**
     * 父机构ID（一级机构的parentId为null，二级机构需要一级机构ID，三级机构需要二级机构ID）
     */
    private Long parentId;

    /**
     * 描述
     */
    @Size(max = 500, message = "描述长度不能超过500个字符")
    private String description;
}

