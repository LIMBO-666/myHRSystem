package com.example.system.management.controller;

import com.example.common.annotation.RequireRole;
import com.example.common.dto.ApiResponse;
import com.example.common.dto.CreateOrganizationRequest;
import com.example.common.dto.OrganizationResponse;
import com.example.common.dto.UpdateOrganizationRequest;
import com.example.common.entity.Organization;
import com.example.common.enums.OrgStatus;
import com.example.storage.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 机构关系设置 Controller
 * 只有人力资源经理可以访问
 */
@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
@RequireRole({"HR_MANAGER", "SYSTEM_ADMIN"})
public class OrganizationController {

    private final OrganizationService organizationService;

    /**
     * 获取一级机构列表
     * 人事专员和人事经理都可以访问（用于档案登记）
     */
    @GetMapping("/level1")
    @RequireRole({"HR_MANAGER", "HR_SPECIALIST", "SYSTEM_ADMIN"})
    public ApiResponse<List<OrganizationResponse>> getFirstLevelOrgs() {
        List<Organization> orgs = organizationService.getFirstLevelOrgs();
        // 只返回激活状态的机构
        List<OrganizationResponse> responses = orgs.stream()
                .filter(org -> OrgStatus.ACTIVE.getCode().equals(org.getStatus()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("查询成功", responses);
    }

    /**
     * 获取二级机构列表（根据一级机构ID）
     * 人事专员和人事经理都可以访问（用于档案登记）
     */
    @GetMapping("/level2")
    @RequireRole({"HR_MANAGER", "HR_SPECIALIST", "SYSTEM_ADMIN"})
    public ApiResponse<List<OrganizationResponse>> getSecondLevelOrgs(@RequestParam(value = "parentId", required = false) Long parentId) {
        List<Organization> orgs;
        if (parentId != null) {
            orgs = organizationService.getSecondLevelOrgs(parentId);
        } else {
            // 如果没有提供parentId，返回所有二级机构
            orgs = organizationService.getByOrgLevel(2);
        }
        // 只返回激活状态的机构
        List<OrganizationResponse> responses = orgs.stream()
                .filter(org -> OrgStatus.ACTIVE.getCode().equals(org.getStatus()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("查询成功", responses);
    }

    /**
     * 获取三级机构列表（根据二级机构ID）
     * 人事专员和人事经理都可以访问（用于档案登记）
     */
    @GetMapping("/level3")
    @RequireRole({"HR_MANAGER", "HR_SPECIALIST", "SYSTEM_ADMIN"})
    public ApiResponse<List<OrganizationResponse>> getThirdLevelOrgs(@RequestParam(value = "parentId", required = false) Long parentId) {
        List<Organization> orgs;
        if (parentId != null) {
            orgs = organizationService.getThirdLevelOrgs(parentId);
        } else {
            // 如果没有提供parentId，返回所有三级机构
            orgs = organizationService.getByOrgLevel(3);
        }
        // 只返回激活状态的机构
        List<OrganizationResponse> responses = orgs.stream()
                .filter(org -> OrgStatus.ACTIVE.getCode().equals(org.getStatus()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("查询成功", responses);
    }

    /**
     * 获取所有二级机构列表（不依赖父机构）
     * 人事专员和人事经理都可以访问（用于档案登记）
     */
    @GetMapping("/level2/all")
    @RequireRole({"HR_MANAGER", "HR_SPECIALIST", "SYSTEM_ADMIN"})
    public ApiResponse<List<OrganizationResponse>> getAllSecondLevelOrgs() {
        List<Organization> orgs = organizationService.getByOrgLevel(2);
        // 只返回激活状态的机构
        List<OrganizationResponse> responses = orgs.stream()
                .filter(org -> OrgStatus.ACTIVE.getCode().equals(org.getStatus()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("查询成功", responses);
    }

    /**
     * 获取所有三级机构列表（不依赖父机构）
     * 人事专员和人事经理都可以访问（用于档案登记）
     */
    @GetMapping("/level3/all")
    @RequireRole({"HR_MANAGER", "HR_SPECIALIST", "SYSTEM_ADMIN"})
    public ApiResponse<List<OrganizationResponse>> getAllThirdLevelOrgs() {
        List<Organization> orgs = organizationService.getByOrgLevel(3);
        // 只返回激活状态的机构
        List<OrganizationResponse> responses = orgs.stream()
                .filter(org -> OrgStatus.ACTIVE.getCode().equals(org.getStatus()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("查询成功", responses);
    }

    /**
     * 根据一级机构ID获取该一级机构下的所有三级机构列表
     * 人事专员和人事经理都可以访问（用于档案登记）
     */
    @GetMapping("/level3/by-first")
    @RequireRole({"HR_MANAGER", "HR_SPECIALIST", "SYSTEM_ADMIN"})
    public ApiResponse<List<OrganizationResponse>> getThirdLevelOrgsByFirstOrgId(@RequestParam("firstOrgId") Long firstOrgId) {
        List<Organization> orgs = organizationService.getThirdLevelOrgsByFirstOrgId(firstOrgId);
        // 只返回激活状态的机构
        List<OrganizationResponse> responses = orgs.stream()
                .filter(org -> OrgStatus.ACTIVE.getCode().equals(org.getStatus()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("查询成功", responses);
    }

    /**
     * 根据机构ID获取机构详情（包括父机构信息）
     * 人事专员和人事经理都可以访问（用于档案登记）
     */
    @GetMapping("/{orgId}")
    @RequireRole({"HR_MANAGER", "HR_SPECIALIST", "SYSTEM_ADMIN"})
    public ApiResponse<OrganizationResponse> getOrgById(@PathVariable("orgId") Long orgId) {
        Organization org = organizationService.getById(orgId);
        if (org == null) {
            return ApiResponse.error(404, "机构不存在");
        }
        if (!OrgStatus.ACTIVE.getCode().equals(org.getStatus())) {
            return ApiResponse.error(404, "机构已禁用");
        }
        return ApiResponse.success("查询成功", convertToResponse(org));
    }

    /**
     * 创建一级机构
     */
    @PostMapping("/level1")
    public ApiResponse<OrganizationResponse> createFirstLevelOrg(@Valid @RequestBody CreateOrganizationRequest request) {
        try {
            // 验证机构编号唯一性
            ApiResponse<Void> validationResult = validateOrgCodeUnique(request.getOrgCode(), null, 1, null);
            if (validationResult != null) {
                return ApiResponse.error(validationResult.getCode(), validationResult.getMessage());
            }

            Organization org = new Organization();
            org.setOrgName(request.getOrgName());
            org.setOrgCode(request.getOrgCode());
            org.setOrgLevel(1);
            org.setParentId(null);
            org.setDescription(request.getDescription());
            org.setStatus(OrgStatus.ACTIVE.getCode());

            boolean saved = organizationService.save(org);
            if (!saved) {
                return ApiResponse.error(500, "创建失败");
            }
            
            // 重新获取保存后的数据，确保包含自动生成的ID
            Organization savedOrg = organizationService.getById(org.getOrgId());
            if (savedOrg == null) {
                return ApiResponse.error(500, "创建失败：无法获取保存后的数据");
            }
            
            return ApiResponse.success("创建成功", convertToResponse(savedOrg));
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(500, "创建失败: " + e.getMessage());
        }
    }

    /**
     * 创建二级机构
     */
    @PostMapping("/level2")
    public ApiResponse<OrganizationResponse> createSecondLevelOrg(@Valid @RequestBody CreateOrganizationRequest request) {
        try {
            if (request.getParentId() == null) {
                return ApiResponse.error(400, "二级机构必须指定父机构（一级机构）");
            }

            // 验证父机构是一级机构
            Organization parentOrg = organizationService.getById(request.getParentId());
            if (parentOrg == null || !parentOrg.getOrgLevel().equals(1)) {
                return ApiResponse.error(400, "父机构必须是一级机构");
            }

            // 验证机构编号唯一性
            ApiResponse<Void> validationResult = validateOrgCodeUnique(request.getOrgCode(), null, 2, request.getParentId());
            if (validationResult != null) {
                return ApiResponse.error(validationResult.getCode(), validationResult.getMessage());
            }

            Organization org = new Organization();
            org.setOrgName(request.getOrgName());
            org.setOrgCode(request.getOrgCode());
            org.setOrgLevel(2);
            org.setParentId(request.getParentId());
            org.setDescription(request.getDescription());
            org.setStatus(OrgStatus.ACTIVE.getCode());

            boolean saved = organizationService.save(org);
            if (!saved) {
                return ApiResponse.error(500, "创建失败");
            }
            
            // 重新获取保存后的数据，确保包含自动生成的ID
            Organization savedOrg = organizationService.getById(org.getOrgId());
            if (savedOrg == null) {
                return ApiResponse.error(500, "创建失败：无法获取保存后的数据");
            }
            
            return ApiResponse.success("创建成功", convertToResponse(savedOrg));
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(500, "创建失败: " + e.getMessage());
        }
    }

    /**
     * 创建三级机构
     */
    @PostMapping("/level3")
    public ApiResponse<OrganizationResponse> createThirdLevelOrg(@Valid @RequestBody CreateOrganizationRequest request) {
        try {
            if (request.getParentId() == null) {
                return ApiResponse.error(400, "三级机构必须指定父机构（二级机构）");
            }

            // 验证父机构是二级机构
            Organization parentOrg = organizationService.getById(request.getParentId());
            if (parentOrg == null || !parentOrg.getOrgLevel().equals(2)) {
                return ApiResponse.error(400, "父机构必须是二级机构");
            }

            // 验证机构编号唯一性
            ApiResponse<Void> validationResult = validateOrgCodeUnique(request.getOrgCode(), null, 3, request.getParentId());
            if (validationResult != null) {
                return ApiResponse.error(validationResult.getCode(), validationResult.getMessage());
            }

            Organization org = new Organization();
            org.setOrgName(request.getOrgName());
            org.setOrgCode(request.getOrgCode());
            org.setOrgLevel(3);
            org.setParentId(request.getParentId());
            org.setDescription(request.getDescription());
            org.setStatus(OrgStatus.ACTIVE.getCode());

            boolean saved = organizationService.save(org);
            if (!saved) {
                return ApiResponse.error(500, "创建失败");
            }
            
            // 重新获取保存后的数据，确保包含自动生成的ID
            Organization savedOrg = organizationService.getById(org.getOrgId());
            if (savedOrg == null) {
                return ApiResponse.error(500, "创建失败：无法获取保存后的数据");
            }
            
            return ApiResponse.success("创建成功", convertToResponse(savedOrg));
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(500, "创建失败: " + e.getMessage());
        }
    }

    /**
     * 根据机构ID获取机构详情（包括父机构信息）
     * 注意：这个方法会被上面的getOrgById覆盖，需要调整路径
     */
    @GetMapping("/detail/{orgId}")
    @RequireRole({"HR_MANAGER", "HR_SPECIALIST", "SYSTEM_ADMIN"})
    public ApiResponse<OrganizationResponse> getOrgDetailById(@PathVariable("orgId") Long orgId) {
        Organization org = organizationService.getById(orgId);
        if (org == null) {
            return ApiResponse.error(404, "机构不存在");
        }
        if (!OrgStatus.ACTIVE.getCode().equals(org.getStatus())) {
            return ApiResponse.error(404, "机构已禁用");
        }
        return ApiResponse.success("查询成功", convertToResponse(org));
    }

    /**
     * 更新机构信息
     */
    @PutMapping("/{orgId}")
    public ApiResponse<OrganizationResponse> updateOrg(@PathVariable("orgId") Long orgId,
                                                         @Valid @RequestBody UpdateOrganizationRequest request) {
        try {
            Organization org = organizationService.getById(orgId);
            if (org == null) {
                return ApiResponse.error(404, "机构不存在");
            }

            // 更新机构代码（如果提供）
            if (request.getOrgCode() != null && !request.getOrgCode().trim().isEmpty()) {
                String newOrgCode = request.getOrgCode().trim();
                // 如果机构代码发生变化，需要验证唯一性并更新
                if (!newOrgCode.equals(org.getOrgCode())) {
                    ApiResponse<Void> validationResult = validateOrgCodeUnique(
                            newOrgCode, orgId, org.getOrgLevel(), org.getParentId());
                    if (validationResult != null) {
                        return ApiResponse.error(validationResult.getCode(), validationResult.getMessage());
                    }
                    org.setOrgCode(newOrgCode);
                }
                // 注意：如果机构代码没有变化，不更新，避免不必要的数据库操作
            }

            // 更新机构名称（如果提供）
            if (request.getOrgName() != null && !request.getOrgName().trim().isEmpty()) {
                org.setOrgName(request.getOrgName().trim());
            }
            // 更新描述（如果提供，允许为空字符串）
            if (request.getDescription() != null) {
                org.setDescription(request.getDescription().trim());
            }

            // 确保必填字段不为空（org_code, org_name, org_level, status）
            if (org.getOrgName() == null || org.getOrgName().trim().isEmpty()) {
                return ApiResponse.error(400, "机构名称不能为空");
            }
            if (org.getOrgCode() == null || org.getOrgCode().trim().isEmpty()) {
                return ApiResponse.error(400, "机构编号不能为空");
            }
            if (org.getOrgLevel() == null) {
                return ApiResponse.error(400, "机构级别不能为空");
            }
            if (org.getStatus() == null || org.getStatus().trim().isEmpty()) {
                org.setStatus(OrgStatus.ACTIVE.getCode());
            }

            boolean updated = organizationService.updateById(org);
            if (!updated) {
                return ApiResponse.error(500, "更新失败");
            }
            
            // 重新获取更新后的数据，确保包含所有字段
            Organization updatedOrg = organizationService.getById(orgId);
            return ApiResponse.success("更新成功", convertToResponse(updatedOrg));
        } catch (Exception e) {
            e.printStackTrace(); // 打印异常堆栈，便于调试
            return ApiResponse.error(500, "更新失败: " + e.getMessage());
        }
    }

    /**
     * 删除机构（软删除，设置状态为INACTIVE）
     */
    @DeleteMapping("/{orgId}")
    public ApiResponse<Void> deleteOrg(@PathVariable("orgId") Long orgId) {
        Organization org = organizationService.getById(orgId);
        if (org == null) {
            return ApiResponse.error(404, "机构不存在");
        }

        // 检查是否有子机构
        List<Organization> children = organizationService.getByParentId(orgId);
        if (!children.isEmpty()) {
            return ApiResponse.error(400, "该机构下存在子机构，无法删除");
        }

        // 软删除：设置状态为INACTIVE
        org.setStatus(OrgStatus.INACTIVE.getCode());
        organizationService.updateById(org);
        return ApiResponse.success("删除成功", null);
    }

    /**
     * 转换为响应对象
     */
    private OrganizationResponse convertToResponse(Organization org) {
        OrganizationResponse response = new OrganizationResponse();
        BeanUtils.copyProperties(org, response);
        return response;
    }

    /**
     * 验证机构编号唯一性
     * 在同一父机构下，同一级别的机构编号必须唯一
     * @return 如果验证失败返回错误响应，否则返回null
     */
    private ApiResponse<Void> validateOrgCodeUnique(String orgCode, Long excludeOrgId, Integer orgLevel, Long parentId) {
        List<Organization> existingOrgs = organizationService.getByOrgLevel(orgLevel);
        for (Organization existing : existingOrgs) {
            if (excludeOrgId != null && existing.getOrgId().equals(excludeOrgId)) {
                continue;
            }
            if (existing.getOrgCode().equals(orgCode)) {
                // 一级机构：编号全局唯一
                if (orgLevel == 1) {
                    return ApiResponse.error(400, "机构编号已存在");
                }
                // 二级机构：同一一级机构下编号唯一
                if (orgLevel == 2 && existing.getParentId().equals(parentId)) {
                    return ApiResponse.error(400, "该一级机构下已存在相同编号的二级机构");
                }
                // 三级机构：同一二级机构下编号唯一
                if (orgLevel == 3 && existing.getParentId().equals(parentId)) {
                    return ApiResponse.error(400, "该二级机构下已存在相同编号的三级机构");
                }
            }
        }
        return null;
    }
}

