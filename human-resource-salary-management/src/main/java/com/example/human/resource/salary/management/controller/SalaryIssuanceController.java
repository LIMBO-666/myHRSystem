package com.example.human.resource.salary.management.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.common.annotation.RequireRole;
import com.example.common.dto.*;
import com.example.common.entity.*;
import com.example.common.exception.AuthenticationException;
import com.example.storage.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 薪酬发放管理 Controller
 */
@RestController
@RequestMapping("/api/salary-issuances")
@RequiredArgsConstructor
public class SalaryIssuanceController {

    private final SalaryIssuanceService salaryIssuanceService;
    private final SalaryIssuanceDetailService salaryIssuanceDetailService;
    private final OrganizationService organizationService;
    private final UserService userService;
    private final EmployeeArchiveService employeeArchiveService;
    private final SalaryStandardService salaryStandardService;
    private final SalaryStandardItemService salaryStandardItemService;
    private final SalaryItemService salaryItemService;

    /**
     * 获取待登记薪酬发放单列表
     * 按三级机构列出需要进行发放登记的薪酬发放单
     */
    @GetMapping("/pending-registration")
    @RequireRole({"SALARY_SPECIALIST"})
    public ApiResponse<List<PendingRegistrationResponse>> getPendingRegistrationList(
            @RequestParam(value = "issuanceMonth", required = false) String issuanceMonth,
            @RequestParam(value = "thirdOrgId", required = false) Long thirdOrgId) {
        List<PendingRegistrationResponse> list = salaryIssuanceService.getPendingRegistrationList(issuanceMonth, thirdOrgId);
        return ApiResponse.success("查询成功", list);
    }

    /**
     * 获取用于登记的员工明细列表
     * 根据三级机构ID和发放月份获取员工明细（包含薪酬标准信息）
     */
    @GetMapping("/registration-details")
    @RequireRole({"SALARY_SPECIALIST"})
    public ApiResponse<List<SalaryIssuanceDetailResponse>> getRegistrationDetails(
            @RequestParam("thirdOrgId") Long thirdOrgId,
            @RequestParam(value = "issuanceMonth", required = false) String issuanceMonth) {
        List<SalaryIssuanceDetailResponse> details = salaryIssuanceService.getRegistrationDetails(thirdOrgId, issuanceMonth);
        return ApiResponse.success("查询成功", details);
    }

    /**
     * 登记薪酬发放单
     * 薪酬专员登记薪酬发放单
     */
    @PostMapping
    @RequireRole({"SALARY_SPECIALIST"})
    public ApiResponse<SalaryIssuanceResponse> createSalaryIssuance(@Valid @RequestBody CreateSalaryIssuanceRequest request) {
        // 获取当前登录用户ID作为登记人
        Long registrarId = getCurrentUserId();

        // 创建薪酬发放单
        SalaryIssuance issuance = salaryIssuanceService.createSalaryIssuance(request, registrarId);

        // 转换为响应对象
        SalaryIssuanceResponse response = convertToResponse(issuance);

        return ApiResponse.success("登记成功", response);
    }

    /**
     * 获取薪酬发放单详情
     * 包含所有员工明细
     */
    @GetMapping("/{issuanceId}")
    public ApiResponse<SalaryIssuanceResponse> getSalaryIssuance(@PathVariable("issuanceId") Long issuanceId) {
        SalaryIssuance issuance = salaryIssuanceService.getById(issuanceId);
        if (issuance == null) {
            return ApiResponse.error(404, "薪酬发放单不存在");
        }

        SalaryIssuanceResponse response = convertToResponse(issuance);
        return ApiResponse.success("查询成功", response);
    }

    /**
     * 获取待复核薪酬发放单列表
     * 薪酬经理查看待复核的薪酬发放单
     */
    @GetMapping("/pending-review")
    @RequireRole({"SALARY_MANAGER"})
    public ApiResponse<PageResponse<SalaryIssuanceResponse>> getPendingReviewIssuances(
            @RequestParam(value = "issuanceMonth", required = false) String issuanceMonth,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size) {
        int pageNum = (page != null && page > 0) ? page : 1;
        int pageSize = (size != null && size > 0) ? size : 10;
        IPage<SalaryIssuance> pageResult = salaryIssuanceService.getPendingReviewPage(issuanceMonth, pageNum, pageSize);

        List<SalaryIssuanceResponse> responses = pageResult.getRecords().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        PageResponse<SalaryIssuanceResponse> pageResponse = PageResponse.<SalaryIssuanceResponse>builder()
                .total(pageResult.getTotal())
                .list(responses)
                .build();

        return ApiResponse.success("查询成功", pageResponse);
    }

    /**
     * 复核薪酬发放单（通过）
     * 薪酬经理复核薪酬发放单，通过审核（可修改奖励金额和应扣金额）
     */
    @PostMapping("/{issuanceId}/review/approve")
    @RequireRole({"SALARY_MANAGER"})
    public ApiResponse<SalaryIssuanceResponse> approveReview(@PathVariable("issuanceId") Long issuanceId,
                                                              @Valid @RequestBody ReviewApproveIssuanceRequest request) {
        // 获取当前登录用户ID作为复核人
        Long reviewerId = getCurrentUserId();

        // 复核通过
        boolean success = salaryIssuanceService.approveReview(issuanceId, reviewerId, request);
        if (!success) {
            return ApiResponse.error(500, "复核失败");
        }

        // 获取更新后的薪酬发放单
        SalaryIssuance issuance = salaryIssuanceService.getById(issuanceId);
        SalaryIssuanceResponse response = convertToResponse(issuance);

        return ApiResponse.success("复核通过", response);
    }

    /**
     * 复核薪酬发放单（驳回）
     * 薪酬经理复核薪酬发放单，驳回
     */
    @PostMapping("/{issuanceId}/review/reject")
    @RequireRole({"SALARY_MANAGER"})
    public ApiResponse<SalaryIssuanceResponse> rejectReview(@PathVariable("issuanceId") Long issuanceId,
                                                             @Valid @RequestBody ReviewRejectRequest request) {
        // 获取当前登录用户ID作为复核人
        Long reviewerId = getCurrentUserId();

        // 复核驳回
        boolean success = salaryIssuanceService.rejectReview(issuanceId, reviewerId, request.getRejectReason());
        if (!success) {
            return ApiResponse.error(500, "驳回失败");
        }

        // 获取更新后的薪酬发放单
        SalaryIssuance issuance = salaryIssuanceService.getById(issuanceId);
        SalaryIssuanceResponse response = convertToResponse(issuance);

        return ApiResponse.success("已驳回", response);
    }

    /**
     * 查询薪酬发放单
     * 根据条件查询薪酬发放单
     */
    @GetMapping
    public ApiResponse<PageResponse<SalaryIssuanceResponse>> querySalaryIssuances(
            @RequestParam(value = "salarySlipNumber", required = false) String salarySlipNumber,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "thirdOrgId", required = false) Long thirdOrgId,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size) {
        LocalDate start = startDate != null ? LocalDate.parse(startDate) : null;
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : null;

        int pageNum = (page != null && page > 0) ? page : 1;
        int pageSize = (size != null && size > 0) ? size : 10;

        IPage<SalaryIssuance> pageResult = salaryIssuanceService.querySalaryIssuances(
                salarySlipNumber, keyword, start, end, status, thirdOrgId, pageNum, pageSize);

        List<SalaryIssuanceResponse> responses = pageResult.getRecords().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        PageResponse<SalaryIssuanceResponse> pageResponse = PageResponse.<SalaryIssuanceResponse>builder()
                .total(pageResult.getTotal())
                .list(responses)
                .build();

        return ApiResponse.success("查询成功", pageResponse);
    }

    /**
     * 转换为响应对象
     */
    private SalaryIssuanceResponse convertToResponse(SalaryIssuance issuance) {
        SalaryIssuanceResponse response = new SalaryIssuanceResponse();
        BeanUtils.copyProperties(issuance, response);

        // 设置三级机构名称和全路径
        if (issuance.getThirdOrgId() != null) {
            Organization thirdOrg = organizationService.getById(issuance.getThirdOrgId());
            if (thirdOrg != null) {
                response.setThirdOrgName(thirdOrg.getOrgName());
                response.setOrgFullPath(buildOrgFullPath(thirdOrg));
            }
        }

        // 设置登记人姓名
        if (issuance.getRegistrarId() != null) {
            User registrar = userService.getById(issuance.getRegistrarId());
            if (registrar != null) {
                response.setRegistrarName(registrar.getRealName());
            }
        }

        // 设置复核人姓名
        if (issuance.getReviewerId() != null) {
            User reviewer = userService.getById(issuance.getReviewerId());
            if (reviewer != null) {
                response.setReviewerName(reviewer.getRealName());
            }
        }

        // 设置薪酬发放明细列表
        List<SalaryIssuanceDetail> details = salaryIssuanceDetailService.getByIssuanceId(issuance.getIssuanceId());
        List<SalaryIssuanceDetailResponse> detailResponses = details.stream()
                .map(detail -> convertDetailToResponse(detail, issuance.getIssuanceMonth()))
                .collect(Collectors.toList());
        response.setDetails(detailResponses);

        return response;
    }

    /**
     * 转换薪酬发放明细为响应对象
     * 根据发放月份重新计算动态项目，只包含在发放月份之前创建的薪酬项目
     */
    private SalaryIssuanceDetailResponse convertDetailToResponse(SalaryIssuanceDetail detail, LocalDate issuanceMonth) {
        SalaryIssuanceDetailResponse response = new SalaryIssuanceDetailResponse();
        BeanUtils.copyProperties(detail, response);
        
        // 根据发放月份重新计算动态项目，只包含在发放月份之前创建的薪酬项目
        if (issuanceMonth != null && detail.getEmployeeId() != null) {
            LocalDate nextMonth = issuanceMonth.plusMonths(1);
            LocalDateTime nextMonthStart = nextMonth.atStartOfDay();
            
            // 获取员工信息
            EmployeeArchive employee = employeeArchiveService.getById(detail.getEmployeeId());
            if (employee != null && employee.getSalaryStandardId() != null) {
                // 获取薪酬标准
                SalaryStandard standard = salaryStandardService.getById(employee.getSalaryStandardId());
                if (standard != null) {
                    // 获取所有薪酬项目
                    List<SalaryItem> allSalaryItems = salaryItemService.list();
                    Map<Long, SalaryItem> salaryItemMap = allSalaryItems.stream()
                            .collect(Collectors.toMap(SalaryItem::getItemId, item -> item));
                    
                    // 获取薪酬标准项目
                    List<SalaryStandardItem> standardItems = salaryStandardItemService.getByStandardId(standard.getStandardId());
                    
                    Map<String, BigDecimal> dynamicItems = new HashMap<>();
                    
                    for (SalaryStandardItem standardItem : standardItems) {
                        SalaryItem salaryItem = salaryItemMap.get(standardItem.getItemId());
                        if (salaryItem != null) {
                            // 只包含在发放月份之前创建的薪酬项目
                            if (salaryItem.getCreateTime() != null && nextMonthStart != null) {
                                if (!salaryItem.getCreateTime().isBefore(nextMonthStart)) {
                                    // 薪酬项目是在发放月份之后创建的，跳过
                                    continue;
                                }
                            }
                            
                            BigDecimal amount = standardItem.getAmount() != null ? standardItem.getAmount() : BigDecimal.ZERO;
                            String itemCode = salaryItem.getItemCode();
                            
                            // 检查是否映射到固定字段
                            boolean isFixedField = "S001".equals(itemCode) || "S002".equals(itemCode) ||
                                    "S003".equals(itemCode) || "S004".equals(itemCode) ||
                                    "S006".equals(itemCode) || "S007".equals(itemCode) ||
                                    "S008".equals(itemCode) || "S009".equals(itemCode);
                            
                            // 如果是新项目（无法映射到固定字段），放入dynamicItems
                            if (!isFixedField && amount.compareTo(BigDecimal.ZERO) > 0) {
                                dynamicItems.put(itemCode, amount);
                            }
                        }
                    }
                    
                    response.setDynamicItems(dynamicItems);
                }
            }
        }
        
        return response;
    }

    /**
     * 构建机构全路径
     */
    private String buildOrgFullPath(Organization thirdOrg) {
        if (thirdOrg.getParentId() == null) {
            return thirdOrg.getOrgName();
        }

        Organization secondOrg = organizationService.getById(thirdOrg.getParentId());
        if (secondOrg == null || secondOrg.getParentId() == null) {
            return thirdOrg.getOrgName();
        }

        Organization firstOrg = organizationService.getById(secondOrg.getParentId());
        if (firstOrg == null) {
            return thirdOrg.getOrgName();
        }

        return firstOrg.getOrgName() + "/" + secondOrg.getOrgName() + "/" + thirdOrg.getOrgName();
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

