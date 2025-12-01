package com.example.common.dto;

import lombok.Data;

/**
 * 删除员工档案请求DTO
 */
@Data
public class DeleteEmployeeArchiveRequest {
    /**
     * 删除原因
     */
    private String deleteReason;
}

