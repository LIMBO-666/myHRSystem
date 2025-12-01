package com.example.common.dto;

import lombok.Data;

/**
 * 复核驳回请求DTO
 */
@Data
public class ReviewRejectRequest {
    /**
     * 驳回原因
     */
    private String rejectReason;
}

