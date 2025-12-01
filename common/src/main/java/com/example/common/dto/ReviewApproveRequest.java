package com.example.common.dto;

import lombok.Data;

/**
 * 复核通过请求DTO
 */
@Data
public class ReviewApproveRequest {
    /**
     * 复核意见
     */
    private String reviewComments;
}

