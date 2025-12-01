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
 */
@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    /**
     * 获取一级机构列表
     */
    @GetMapping("/level1")
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
     */
    @GetMapping("/level2")
    public ApiResponse<List<OrganizationResponse>> getSecondLevelOrgs(@RequestParam Long parentId) {
        List<Organization> orgs = organizationService.getSecondLevelOrgs(parentId);
        // 只返回激活状态的机构
        List<OrganizationResponse> responses = orgs.stream()
                .filter(org -> OrgStatus.ACTIVE.getCode().equals(org.getStatus()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("查询成功", responses);
    }

    /**
     * 获取三级机构列表（根据二级机构ID）
     */
    @GetMapping("/level3")
    public ApiResponse<List<OrganizationResponse>> getThirdLevelOrgs(@RequestParam Long parentId) {
        List<Organization> orgs = organizationService.getThirdLevelOrgs(parentId);
        // 只返回激活状态的机构
        List<OrganizationResponse> responses = orgs.stream()
                .filter(org -> OrgStatus.ACTIVE.getCode().equals(org.getStatus()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("查询成功", responses);
    }

    /**
     * 创建一级机构
     */
    @PostMapping("/level1")
    @RequireRole({"HR_MANAGER", "SALARY_MANAGER"})
    public ApiResponse<OrganizationResponse> createFirstLevelOrg(@Valid @RequestBody CreateOrganizationRequest request) {
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

        organizationService.save(org);
        return ApiResponse.success("创建成功", convertToResponse(org));
    }

    /**
     * 创建二级机构
     */
    @PostMapping("/level2")
    @RequireRole({"HR_MANAGER", "SALARY_MANAGER"})
    public ApiResponse<OrganizationResponse> createSecondLevelOrg(@Valid @RequestBody CreateOrganizationRequest request) {
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

        organizationService.save(org);
        return ApiResponse.success("创建成功", convertToResponse(org));
    }

    /**
     * 创建三级机构
     */
    @PostMapping("/level3")
    @RequireRole({"HR_MANAGER", "SALARY_MANAGER"})
    public ApiResponse<OrganizationResponse> createThirdLevelOrg(@Valid @RequestBody CreateOrganizationRequest request) {
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

        organizationService.save(org);
        return ApiResponse.success("创建成功", convertToResponse(org));
    }

    /**
     * 更新机构信息
     */
    @PutMapping("/{orgId}")
    @RequireRole({"HR_MANAGER", "SALARY_MANAGER"})
    public ApiResponse<OrganizationResponse> updateOrg(@PathVariable Long orgId,
                                                         @Valid @RequestBody UpdateOrganizationRequest request) {
        Organization org = organizationService.getById(orgId);
        if (org == null) {
            return ApiResponse.error(404, "机构不存在");
        }

        if (request.getOrgName() != null) {
            org.setOrgName(request.getOrgName());
        }
        if (request.getDescription() != null) {
            org.setDescription(request.getDescription());
        }

        organizationService.updateById(org);
        return ApiResponse.success("更新成功", convertToResponse(org));
    }

    /**
     * 删除机构（软删除，设置状态为INACTIVE）
     */
    @DeleteMapping("/{orgId}")
    @RequireRole({"HR_MANAGER", "SALARY_MANAGER"})
    public ApiResponse<Void> deleteOrg(@PathVariable Long orgId) {
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

