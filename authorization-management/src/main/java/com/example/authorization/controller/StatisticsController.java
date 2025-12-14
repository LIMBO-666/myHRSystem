package com.example.authorization.controller;

import com.example.common.dto.ApiResponse;
import com.example.common.enums.EmployeeArchiveStatus;
import com.example.common.enums.OrgStatus;
import com.example.storage.service.EmployeeArchiveService;
import com.example.storage.service.OrganizationService;
import com.example.storage.service.PositionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 统计信息 Controller
 * 不需要登录即可访问（用于登录页面显示）
 */
@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final EmployeeArchiveService employeeArchiveService;
    private final OrganizationService organizationService;
    private final PositionService positionService;

    /**
     * 获取系统统计数据
     * 返回员工总数、部门数量、职位数量
     */
    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Long>> getDashboardStatistics() {
        // 统计正常状态的员工数量
        long employeeCount = employeeArchiveService.getNormal().size();
        
        // 统计激活状态的三级机构数量（部门机构）
        long departmentCount = organizationService.getByOrgLevel(3).stream()
                .filter(org -> OrgStatus.ACTIVE.getCode().equals(org.getStatus()))
                .count();
        
        // 统计所有职位数量（职位表可能没有status字段，直接统计总数）
        long positionCount = positionService.list().size();
        
        Map<String, Long> statistics = new HashMap<>();
        statistics.put("employees", employeeCount);
        statistics.put("departments", departmentCount);
        statistics.put("positions", positionCount);
        
        return ApiResponse.success("查询成功", statistics);
    }
}

