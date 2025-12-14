package com.example.human.resource.salary.management.controller;

import com.example.common.annotation.RequireRole;
import com.example.common.dto.ApiResponse;
import com.example.common.dto.CreateSalaryStandardRequest;
import com.example.common.dto.PageResponse;
import com.example.common.dto.ReviewApproveRequest;
import com.example.common.dto.ReviewRejectRequest;
import com.example.common.dto.SalaryStandardItemResponse;
import com.example.common.dto.SalaryStandardResponse;
import com.example.common.dto.UpdateSalaryStandardRequest;
import com.example.common.entity.Position;
import com.example.common.entity.SalaryItem;
import com.example.common.entity.SalaryStandard;
import com.example.common.entity.SalaryStandardItem;
import com.example.common.entity.User;
import com.example.common.exception.AuthenticationException;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.storage.service.PositionService;
import com.example.storage.service.SalaryItemService;
import com.example.storage.service.SalaryStandardItemService;
import com.example.storage.service.SalaryStandardService;
import com.example.storage.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 薪酬标准管理 Controller
 */
@RestController
@RequestMapping("/api/salary-standards")
@RequiredArgsConstructor
public class SalaryStandardController {

    private final SalaryStandardService salaryStandardService;
    private final SalaryStandardItemService salaryStandardItemService;
    private final PositionService positionService;
    private final UserService userService;
    private final SalaryItemService salaryItemService;

    /**
     * 创建薪酬标准
     * 薪酬专员/薪酬经理登记薪酬标准
     */
    @PostMapping
    @RequireRole({"SALARY_SPECIALIST", "SALARY_MANAGER"})
    public ApiResponse<SalaryStandardResponse> createSalaryStandard(@Valid @RequestBody CreateSalaryStandardRequest request) {
        // 获取当前登录用户ID作为登记人
        Long registrarId = getCurrentUserId();

        // 创建薪酬标准
        SalaryStandard standard = salaryStandardService.createSalaryStandard(request, registrarId);

        // 转换为响应对象
        SalaryStandardResponse response = convertToResponse(standard);

        return ApiResponse.success("登记成功", response);
    }

    /**
     * 获取待复核薪酬标准列表
     * 薪酬经理查看待复核的薪酬标准
     */
    @GetMapping("/pending-review")
    @RequireRole({"SALARY_MANAGER"})
    public ApiResponse<PageResponse<SalaryStandardResponse>> getPendingReviewStandards(
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size) {
        int pageNum = (page != null && page > 0) ? page : 1;
        int pageSize = (size != null && size > 0) ? size : 10;
        IPage<SalaryStandard> pageResult = salaryStandardService.getPendingReviewPage(pageNum, pageSize);

        List<SalaryStandardResponse> responses = pageResult.getRecords().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        PageResponse<SalaryStandardResponse> pageResponse = PageResponse.<SalaryStandardResponse>builder()
                .total(pageResult.getTotal())
                .list(responses)
                .build();

        return ApiResponse.success("查询成功", pageResponse);
    }

    /**
     * 获取薪酬标准详情
     * 包含所有薪酬项目明细
     */
    @GetMapping("/{standardId}")
    public ApiResponse<SalaryStandardResponse> getSalaryStandard(@PathVariable("standardId") Long standardId) {
        SalaryStandard standard = salaryStandardService.getById(standardId);
        if (standard == null) {
            return ApiResponse.error(404, "薪酬标准不存在");
        }

        SalaryStandardResponse response = convertToResponse(standard);
        return ApiResponse.success("查询成功", response);
    }

    /**
     * 复核薪酬标准（通过）
     * 薪酬经理复核薪酬标准，通过审核
     */
    @PostMapping("/{standardId}/review/approve")
    @RequireRole({"SALARY_MANAGER"})
    public ApiResponse<SalaryStandardResponse> approveReview(@PathVariable("standardId") Long standardId,
                                                             @Valid @RequestBody ReviewApproveRequest request) {
        // 获取当前登录用户ID作为复核人
        Long reviewerId = getCurrentUserId();

        // 复核通过
        boolean success = salaryStandardService.approveReview(standardId, reviewerId, request.getReviewComments());
        if (!success) {
            return ApiResponse.error(500, "复核失败");
        }

        // 获取更新后的薪酬标准
        SalaryStandard standard = salaryStandardService.getById(standardId);
        SalaryStandardResponse response = convertToResponse(standard);

        return ApiResponse.success("复核通过", response);
    }

    /**
     * 复核薪酬标准（驳回）
     * 薪酬经理复核薪酬标准，驳回
     */
    @PostMapping("/{standardId}/review/reject")
    @RequireRole({"SALARY_MANAGER"})
    public ApiResponse<SalaryStandardResponse> rejectReview(@PathVariable("standardId") Long standardId,
                                                            @Valid @RequestBody ReviewRejectRequest request) {
        // 获取当前登录用户ID作为复核人
        Long reviewerId = getCurrentUserId();

        // 复核驳回
        boolean success = salaryStandardService.rejectReview(standardId, reviewerId, request.getRejectReason());
        if (!success) {
            return ApiResponse.error(500, "驳回失败");
        }

        // 获取更新后的薪酬标准
        SalaryStandard standard = salaryStandardService.getById(standardId);
        SalaryStandardResponse response = convertToResponse(standard);

        return ApiResponse.success("已驳回", response);
    }

    /**
     * 查询薪酬标准
     * 根据条件查询薪酬标准
     */
    @GetMapping
    public ApiResponse<PageResponse<SalaryStandardResponse>> querySalaryStandards(
            @RequestParam(value = "standardCode", required = false) String standardCode,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "positionId", required = false) Long positionId,
            @RequestParam(value = "jobTitle", required = false) String jobTitle,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size) {
        LocalDate start = startDate != null ? LocalDate.parse(startDate) : null;
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : null;

        int pageNum = (page != null && page > 0) ? page : 1;
        int pageSize = (size != null && size > 0) ? size : 10;

        IPage<SalaryStandard> pageResult = salaryStandardService.querySalaryStandards(
                standardCode, keyword, start, end, status, positionId, jobTitle, pageNum, pageSize);

        List<SalaryStandardResponse> responses = pageResult.getRecords().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        PageResponse<SalaryStandardResponse> pageResponse = PageResponse.<SalaryStandardResponse>builder()
                .total(pageResult.getTotal())
                .list(responses)
                .build();

        // 调试日志
        System.out.println("查询薪酬标准 - 页码: " + pageNum + ", 每页: " + pageSize + ", 总数: " + pageResult.getTotal() + ", 当前页记录数: " + responses.size());

        return ApiResponse.success("查询成功", pageResponse);
    }

    /**
     * 更新薪酬标准
     * 更新薪酬标准（变更后需要重新复核）
     */
    @PutMapping("/{standardId}")
    @RequireRole({"SALARY_SPECIALIST", "SALARY_MANAGER"})
    public ApiResponse<SalaryStandardResponse> updateSalaryStandard(@PathVariable("standardId") Long standardId,
                                                                    @Valid @RequestBody UpdateSalaryStandardRequest request) {
        // 更新薪酬标准
        SalaryStandard standard = salaryStandardService.updateSalaryStandard(standardId, request);

        // 转换为响应对象
        SalaryStandardResponse response = convertToResponse(standard);

        return ApiResponse.success("更新成功，等待复核", response);
    }

    /**
     * 根据职位和职称获取薪酬标准
     * 用于员工档案登记时选择
     */
    @GetMapping("/by-position")
    public ApiResponse<SalaryStandardResponse> getSalaryStandardByPosition(
            @RequestParam("positionId") Long positionId,
            @RequestParam("jobTitle") String jobTitle) {
        SalaryStandard standard = salaryStandardService.getApprovedByPositionIdAndJobTitle(positionId, jobTitle);
        if (standard == null) {
            return ApiResponse.error(404, "未找到已通过的薪酬标准");
        }

        SalaryStandardResponse response = convertToResponse(standard);
        return ApiResponse.success("查询成功", response);
    }

    /**
     * 转换为响应对象
     */
    private SalaryStandardResponse convertToResponse(SalaryStandard standard) {
        SalaryStandardResponse response = new SalaryStandardResponse();
        BeanUtils.copyProperties(standard, response);

        // 设置职位名称
        if (standard.getPositionId() != null) {
            Position position = positionService.getById(standard.getPositionId());
            if (position != null) {
                response.setPositionName(position.getPositionName());
            }
        }

        // 设置制定人姓名
        if (standard.getFormulatorId() != null) {
            User formulator = userService.getById(standard.getFormulatorId());
            if (formulator != null) {
                response.setFormulatorName(formulator.getRealName());
            }
        }

        // 设置登记人姓名
        if (standard.getRegistrarId() != null) {
            User registrar = userService.getById(standard.getRegistrarId());
            if (registrar != null) {
                response.setRegistrarName(registrar.getRealName());
            }
        }

        // 设置复核人姓名
        if (standard.getReviewerId() != null) {
            User reviewer = userService.getById(standard.getReviewerId());
            if (reviewer != null) {
                response.setReviewerName(reviewer.getRealName());
            }
        }

        // 设置薪酬项目明细列表
        List<SalaryStandardItem> items = salaryStandardItemService.getByStandardId(standard.getStandardId());
        List<SalaryStandardItemResponse> itemResponses = items.stream()
                .map(this::convertItemToResponse)
                .collect(Collectors.toList());
        response.setItems(itemResponses);

        return response;
    }

    /**
     * 转换薪酬标准明细为响应对象
     */
    private SalaryStandardItemResponse convertItemToResponse(SalaryStandardItem item) {
        SalaryStandardItemResponse response = new SalaryStandardItemResponse();
        BeanUtils.copyProperties(item, response);

        // 获取薪酬项目信息
        SalaryItem salaryItem = salaryItemService.getById(item.getItemId());
        if (salaryItem != null) {
            response.setItemCode(salaryItem.getItemCode());
            response.setItemName(salaryItem.getItemName());
            response.setItemType(salaryItem.getItemType());
            response.setCalculationRule(salaryItem.getCalculationRule());
        }

        return response;
    }

    /**
     * 获取当前登录用户ID
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
}

