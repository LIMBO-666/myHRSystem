package com.example.system.management.controller;

import com.example.common.annotation.RequireRole;
import com.example.common.dto.ApiResponse;
import com.example.common.dto.CreateSalaryItemRequest;
import com.example.common.dto.SalaryItemResponse;
import com.example.common.dto.UpdateSalaryItemRequest;
import com.example.common.entity.SalaryItem;
import com.example.common.enums.OrgStatus;
import com.example.storage.service.SalaryItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 薪酬项目设置 Controller
 * 只有薪酬经理可以访问
 */
@RestController
@RequestMapping("/api/salary-items")
@RequiredArgsConstructor
@RequireRole({"SALARY_MANAGER", "SYSTEM_ADMIN"})
public class SalaryItemController {

    private final SalaryItemService salaryItemService;

    /**
     * 获取薪酬项目列表
     * 薪酬专员和薪酬经理也可以访问（用于薪酬标准登记）
     */
    @GetMapping
    @RequireRole({"HR_MANAGER", "SALARY_SPECIALIST", "SALARY_MANAGER", "SYSTEM_ADMIN"})
    public ApiResponse<List<SalaryItemResponse>> getSalaryItems(
            @RequestParam(value = "itemType", required = false) String itemType,
            @RequestParam(value = "status", required = false) String status) {
        List<SalaryItem> items;
        if (itemType != null) {
            items = salaryItemService.getByItemType(itemType);
        } else {
            items = salaryItemService.list();
        }

        // 按状态筛选（如果未指定状态，默认只返回激活状态的项目）
        if (status != null) {
            items = items.stream()
                    .filter(item -> status.equals(item.getStatus()))
                    .collect(Collectors.toList());
        } else {
            items = items.stream()
                    .filter(item -> OrgStatus.ACTIVE.getCode().equals(item.getStatus()))
                    .collect(Collectors.toList());
        }

        List<SalaryItemResponse> responses = items.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("查询成功", responses);
    }

    /**
     * 获取薪酬项目详情
     * 薪酬专员和薪酬经理也可以访问（用于薪酬标准登记）
     */
    @GetMapping("/{itemId}")
    @RequireRole({"HR_MANAGER", "SALARY_SPECIALIST", "SALARY_MANAGER", "SYSTEM_ADMIN"})
    public ApiResponse<SalaryItemResponse> getSalaryItem(@PathVariable("itemId") Long itemId) {
        SalaryItem item = salaryItemService.getById(itemId);
        if (item == null) {
            return ApiResponse.error(404, "薪酬项目不存在");
        }
        return ApiResponse.success("查询成功", convertToResponse(item));
    }

    /**
     * 创建薪酬项目
     * 只有薪酬经理可以访问
     */
    @PostMapping
    @RequireRole({"SALARY_MANAGER", "SYSTEM_ADMIN"})
    public ApiResponse<SalaryItemResponse> createSalaryItem(@Valid @RequestBody CreateSalaryItemRequest request) {
        // 验证项目编号唯一性（只检查激活状态的项目）
        SalaryItem existingActive = salaryItemService.getByItemCode(request.getItemCode());
        if (existingActive != null) {
            return ApiResponse.error(400, "项目编号已存在");
        }
        
        // 检查是否有已删除的同项目代码（允许重新使用已删除项目的代码）
        SalaryItem existingInactive = salaryItemService.getByItemCodeIncludingInactive(request.getItemCode());
        SalaryItem item;
        
        if (existingInactive != null && OrgStatus.INACTIVE.getCode().equals(existingInactive.getStatus())) {
            // 如果存在已删除的项目，恢复并更新它
            item = existingInactive;
            item.setItemName(request.getItemName());
            item.setItemType(request.getItemType());
            item.setCalculationRule(request.getCalculationRule());
            item.setSortOrder(request.getSortOrder());
            item.setStatus(OrgStatus.ACTIVE.getCode());
            salaryItemService.updateById(item);
            return ApiResponse.success("创建成功（已恢复已删除的项目）", convertToResponse(item));
        }

        // 验证排序值唯一性
        if (request.getSortOrder() != null) {
            SalaryItem existingBySortOrder = salaryItemService.getBySortOrder(request.getSortOrder());
            if (existingBySortOrder != null) {
                return ApiResponse.error(400, "排序值已存在，请使用其他排序值");
            }
        }

        // 创建新项目
        item = new SalaryItem();
        item.setItemCode(request.getItemCode());
        item.setItemName(request.getItemName());
        item.setItemType(request.getItemType());
        item.setCalculationRule(request.getCalculationRule());
        item.setSortOrder(request.getSortOrder());
        item.setStatus(OrgStatus.ACTIVE.getCode());

        salaryItemService.save(item);
        return ApiResponse.success("创建成功", convertToResponse(item));
    }

    /**
     * 更新薪酬项目
     * 只有薪酬经理可以访问
     */
    @PutMapping("/{itemId}")
    @RequireRole({"SALARY_MANAGER", "SYSTEM_ADMIN"})
    public ApiResponse<SalaryItemResponse> updateSalaryItem(@PathVariable("itemId") Long itemId,
                                                             @Valid @RequestBody UpdateSalaryItemRequest request) {
        SalaryItem item = salaryItemService.getById(itemId);
        if (item == null) {
            return ApiResponse.error(404, "薪酬项目不存在");
        }

        if (request.getItemName() != null) {
            item.setItemName(request.getItemName());
        }
        if (request.getCalculationRule() != null) {
            item.setCalculationRule(request.getCalculationRule());
        }
        if (request.getSortOrder() != null) {
            // 验证排序值唯一性（排除当前项目）
            SalaryItem existingBySortOrder = salaryItemService.getBySortOrder(request.getSortOrder());
            if (existingBySortOrder != null && !existingBySortOrder.getItemId().equals(itemId)) {
                return ApiResponse.error(400, "排序值已存在，请使用其他排序值");
            }
            item.setSortOrder(request.getSortOrder());
        }

        salaryItemService.updateById(item);
        return ApiResponse.success("更新成功", convertToResponse(item));
    }

    /**
     * 删除薪酬项目（软删除）
     * 只有薪酬经理可以访问
     */
    @DeleteMapping("/{itemId}")
    @RequireRole({"SALARY_MANAGER", "SYSTEM_ADMIN"})
    public ApiResponse<Void> deleteSalaryItem(@PathVariable("itemId") Long itemId) {
        SalaryItem item = salaryItemService.getById(itemId);
        if (item == null) {
            return ApiResponse.error(404, "薪酬项目不存在");
        }

        // 软删除：设置状态为INACTIVE
        item.setStatus(OrgStatus.INACTIVE.getCode());
        salaryItemService.updateById(item);
        return ApiResponse.success("删除成功", null);
    }

    /**
     * 转换为响应对象
     */
    private SalaryItemResponse convertToResponse(SalaryItem item) {
        SalaryItemResponse response = new SalaryItemResponse();
        BeanUtils.copyProperties(item, response);
        return response;
    }
}

