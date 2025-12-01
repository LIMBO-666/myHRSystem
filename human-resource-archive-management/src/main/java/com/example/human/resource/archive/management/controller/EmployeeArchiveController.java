package com.example.human.resource.archive.management.controller;

import com.example.common.annotation.RequireRole;
import com.example.common.dto.*;
import com.example.common.entity.User;
import com.example.common.exception.AuthenticationException;
import com.example.human.resource.archive.management.service.EmployeeArchiveManagementService;
import com.example.storage.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * 人力资源档案管理 Controller
 */
@RestController
@RequestMapping("/api/employee-archives")
@RequiredArgsConstructor
public class EmployeeArchiveController {

    private final EmployeeArchiveManagementService employeeArchiveManagementService;
    private final UserService userService;

    /**
     * 创建员工档案
     * 人事专员登记新员工档案
     *
     * @param request 创建请求
     * @return 响应
     */
    @PostMapping
    @RequireRole({"HR_SPECIALIST"})
    public ApiResponse<EmployeeArchiveResponse> createEmployeeArchive(@Valid @RequestBody CreateEmployeeArchiveRequest request) {
        try {
            // 获取当前登录用户ID
            Long registrarId = getCurrentUserId();

            // 创建员工档案
            EmployeeArchiveResponse response = employeeArchiveManagementService.createEmployeeArchive(request, registrarId);

            return ApiResponse.success("登记成功", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 上传员工照片
     * 人事专员上传员工照片
     *
     * @param archiveId 档案ID
     * @param file 照片文件
     * @return 响应
     */
    @PostMapping("/{archiveId}/photo")
    @RequireRole({"HR_SPECIALIST"})
    public ApiResponse<Map<String, String>> uploadPhoto(
            @PathVariable Long archiveId,
            @RequestParam("file") MultipartFile file) {
        try {
            // 上传照片
            String photoUrl = employeeArchiveManagementService.uploadPhoto(archiveId, file);

            // 构建响应
            Map<String, String> data = new HashMap<>();
            data.put("photoUrl", photoUrl);

            return ApiResponse.success("上传成功", data);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取当前登录用户ID
     *
     * @return 用户ID
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AuthenticationException("用户未登录");
        }

        // 获取用户名
        String username = authentication.getName();

        // 根据用户名查询用户信息
        User user = userService.getByUsername(username);
        if (user == null) {
            throw new AuthenticationException("用户不存在");
        }

        return user.getUserId();
    }

    /**
     * 查询员工档案
     * 根据条件查询员工档案，支持多条件组合查询和分页
     *
     * @param firstOrgId 一级机构ID（可选）
     * @param secondOrgId 二级机构ID（可选）
     * @param thirdOrgId 三级机构ID（可选）
     * @param positionId 职位ID（可选）
     * @param startDate 建档起始日期，格式：yyyy-MM-dd（可选）
     * @param endDate 建档结束日期，格式：yyyy-MM-dd（可选）
     * @param status 状态，PENDING_REVIEW(待复核), NORMAL(正常), DELETED(已删除)（可选）
     * @param page 页码，默认1
     * @param size 每页数量，默认10
     * @return 响应
     */
    @GetMapping
    @RequireRole({"HR_SPECIALIST", "HR_MANAGER"})
    public ApiResponse<PageResponse<EmployeeArchiveResponse>> queryEmployeeArchives(
            @RequestParam(required = false) Long firstOrgId,
            @RequestParam(required = false) Long secondOrgId,
            @RequestParam(required = false) Long thirdOrgId,
            @RequestParam(required = false) Long positionId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        try {
            PageResponse<EmployeeArchiveResponse> response = employeeArchiveManagementService.queryEmployeeArchives(
                    firstOrgId,
                    secondOrgId,
                    thirdOrgId,
                    positionId,
                    startDate,
                    endDate,
                    status,
                    page,
                    size
            );
            return ApiResponse.success("查询成功", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取待复核档案列表
     * 人事经理获取所有待复核的员工档案列表
     *
     * @param page 页码，默认1
     * @param size 每页数量，默认10
     * @return 响应
     */
    @GetMapping("/pending-review")
    @RequireRole({"HR_MANAGER"})
    public ApiResponse<PageResponse<EmployeeArchiveResponse>> getPendingReviewList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        try {
            PageResponse<EmployeeArchiveResponse> response = employeeArchiveManagementService.getPendingReviewList(page, size);
            return ApiResponse.success("查询成功", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取档案详情
     *
     * @param archiveId 档案ID
     * @return 响应
     */
    @GetMapping("/{archiveId}")
    public ApiResponse<EmployeeArchiveResponse> getArchiveDetail(@PathVariable Long archiveId) {
        try {
            EmployeeArchiveResponse response = employeeArchiveManagementService.getArchiveDetail(archiveId);
            return ApiResponse.success("查询成功", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 复核档案（通过）
     * 人事经理复核档案，通过审核（不修改信息）
     *
     * @param archiveId 档案ID
     * @param request 复核请求
     * @return 响应
     */
    @PostMapping("/{archiveId}/review/approve")
    @RequireRole({"HR_MANAGER"})
    public ApiResponse<EmployeeArchiveResponse> approveReview(
            @PathVariable Long archiveId,
            @RequestBody ReviewApproveRequest request) {
        try {
            // 获取当前登录用户ID
            Long reviewerId = getCurrentUserId();

            // 复核通过
            EmployeeArchiveResponse response = employeeArchiveManagementService.approveReview(archiveId, request, reviewerId);

            return ApiResponse.success("复核通过", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 复核档案（修改后通过）
     * 人事经理复核档案时修改信息（档案编号、所属机构、职位不能修改）
     *
     * @param archiveId 档案ID
     * @param request 复核并修改请求
     * @return 响应
     */
    @PutMapping("/{archiveId}/review")
    @RequireRole({"HR_MANAGER"})
    public ApiResponse<EmployeeArchiveResponse> approveReviewWithUpdate(
            @PathVariable Long archiveId,
            @Valid @RequestBody ReviewWithUpdateRequest request) {
        try {
            // 获取当前登录用户ID
            Long reviewerId = getCurrentUserId();

            // 复核通过（修改后通过）
            EmployeeArchiveResponse response = employeeArchiveManagementService.approveReviewWithUpdate(archiveId, request, reviewerId);

            return ApiResponse.success("复核通过", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 更新员工档案
     * 人事专员更新员工档案（档案编号、所属机构、职位不能修改）
     * 更新后状态变为待复核
     *
     * @param archiveId 档案ID
     * @param request 更新请求
     * @return 响应
     */
    @PutMapping("/{archiveId}")
    @RequireRole({"HR_SPECIALIST"})
    public ApiResponse<EmployeeArchiveResponse> updateEmployeeArchive(
            @PathVariable Long archiveId,
            @Valid @RequestBody UpdateEmployeeArchiveRequest request) {
        try {
            // 更新员工档案
            EmployeeArchiveResponse response = employeeArchiveManagementService.updateEmployeeArchive(archiveId, request);

            return ApiResponse.success("更新成功，等待复核", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取已删除档案列表
     * 人事经理获取所有已删除的员工档案列表
     *
     * @param page 页码，默认1
     * @param size 每页数量，默认10
     * @return 响应
     */
    @GetMapping("/deleted")
    @RequireRole({"HR_MANAGER"})
    public ApiResponse<PageResponse<EmployeeArchiveResponse>> getDeletedList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        try {
            PageResponse<EmployeeArchiveResponse> response = employeeArchiveManagementService.getDeletedList(page, size);
            return ApiResponse.success("查询成功", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 删除员工档案
     * 人事经理删除员工档案（软删除，设置状态为DELETED）
     * 状态为"待复核"的员工档案不能删除
     *
     * @param archiveId 档案ID
     * @param request 删除请求（包含删除原因）
     * @return 响应
     */
    @DeleteMapping("/{archiveId}")
    @RequireRole({"HR_MANAGER"})
    public ApiResponse<EmployeeArchiveResponse> deleteEmployeeArchive(
            @PathVariable Long archiveId,
            @RequestBody DeleteEmployeeArchiveRequest request) {
        try {
            // 删除员工档案
            EmployeeArchiveResponse response = employeeArchiveManagementService.deleteEmployeeArchive(
                    archiveId,
                    request.getDeleteReason()
            );

            return ApiResponse.success("删除成功", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 恢复员工档案
     * 人事经理恢复已删除的员工档案
     *
     * @param archiveId 档案ID
     * @return 响应
     */
    @PostMapping("/{archiveId}/restore")
    @RequireRole({"HR_MANAGER"})
    public ApiResponse<EmployeeArchiveResponse> restoreEmployeeArchive(@PathVariable Long archiveId) {
        try {
            // 恢复员工档案
            EmployeeArchiveResponse response = employeeArchiveManagementService.restoreEmployeeArchive(archiveId);

            return ApiResponse.success("恢复成功", response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}

