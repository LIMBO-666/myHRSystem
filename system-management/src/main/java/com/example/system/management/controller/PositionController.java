package com.example.system.management.controller;

import com.example.common.annotation.RequireRole;
import com.example.common.dto.ApiResponse;
import com.example.common.dto.CreatePositionRequest;
import com.example.common.dto.PositionResponse;
import com.example.common.dto.UpdatePositionRequest;
import com.example.common.entity.Organization;
import com.example.common.entity.Position;
import com.example.common.enums.OrgStatus;
import com.example.storage.service.OrganizationService;
import com.example.storage.service.PositionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 职位设置 Controller
 * 只有人力资源经理可以访问
 */
@RestController
@RequestMapping("/api/positions")
@RequiredArgsConstructor
@RequireRole({"HR_MANAGER"})
public class PositionController {

    private final PositionService positionService;
    private final OrganizationService organizationService;

    /**
     * 获取职位列表，支持按一级机构、二级机构或三级机构筛选
     * 人事专员、人事经理、薪酬专员和薪酬经理都可以访问（用于档案登记和薪酬标准登记）
     */
    @GetMapping
    @RequireRole({"HR_MANAGER", "HR_SPECIALIST", "SALARY_SPECIALIST", "SALARY_MANAGER"})
    public ApiResponse<List<PositionResponse>> getPositions(
            @RequestParam(value = "firstOrgId", required = false) Long firstOrgId,
            @RequestParam(value = "secondOrgId", required = false) Long secondOrgId,
            @RequestParam(value = "thirdOrgId", required = false) Long thirdOrgId) {
        List<Position> positions;
        
        if (thirdOrgId != null) {
            // 按三级机构查询
            positions = positionService.getByThirdOrgId(thirdOrgId);
        } else if (secondOrgId != null) {
            // 按二级机构查询
            positions = positionService.getBySecondOrgId(secondOrgId);
        } else if (firstOrgId != null) {
            // 按一级机构查询
            positions = positionService.getByFirstOrgId(firstOrgId);
        } else {
            // 查询所有职位
            positions = positionService.list();
        }

        // 只返回激活状态的职位
        List<PositionResponse> responses = positions.stream()
                .filter(position -> OrgStatus.ACTIVE.getCode().equals(position.getStatus()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("查询成功", responses);
    }

    /**
     * 获取职位详情
     * 人事专员、人事经理、薪酬专员和薪酬经理都可以访问（用于档案登记和薪酬标准登记）
     */
    @GetMapping("/{positionId}")
    @RequireRole({"HR_MANAGER", "HR_SPECIALIST", "SALARY_SPECIALIST", "SALARY_MANAGER"})
    public ApiResponse<PositionResponse> getPosition(@PathVariable("positionId") Long positionId) {
        Position position = positionService.getById(positionId);
        if (position == null) {
            return ApiResponse.error(404, "职位不存在");
        }
        return ApiResponse.success("查询成功", convertToResponse(position));
    }

    /**
     * 创建职位
     */
    @PostMapping
    public ApiResponse<PositionResponse> createPosition(@Valid @RequestBody CreatePositionRequest request) {
        // 验证三级机构是否存在且为激活状态
        Organization thirdOrg = organizationService.getById(request.getThirdOrgId());
        if (thirdOrg == null) {
            return ApiResponse.error(404, "三级机构不存在");
        }
        if (!thirdOrg.getOrgLevel().equals(3)) {
            return ApiResponse.error(400, "指定的机构不是三级机构");
        }
        if (!OrgStatus.ACTIVE.getCode().equals(thirdOrg.getStatus())) {
            return ApiResponse.error(400, "指定的三级机构未激活");
        }

        Position position = new Position();
        position.setPositionName(request.getPositionName());
        position.setThirdOrgId(request.getThirdOrgId());
        position.setDescription(request.getDescription());
        position.setStatus(OrgStatus.ACTIVE.getCode());

        positionService.save(position);
        return ApiResponse.success("创建成功", convertToResponse(position));
    }

    /**
     * 更新职位
     */
    @PutMapping("/{positionId}")
    public ApiResponse<PositionResponse> updatePosition(@PathVariable("positionId") Long positionId,
                                                         @Valid @RequestBody UpdatePositionRequest request) {
        Position position = positionService.getById(positionId);
        if (position == null) {
            return ApiResponse.error(404, "职位不存在");
        }

        if (request.getPositionName() != null) {
            position.setPositionName(request.getPositionName());
        }
        if (request.getDescription() != null) {
            position.setDescription(request.getDescription());
        }

        positionService.updateById(position);
        return ApiResponse.success("更新成功", convertToResponse(position));
    }

    /**
     * 删除职位（软删除）
     */
    @DeleteMapping("/{positionId}")
    public ApiResponse<Void> deletePosition(@PathVariable("positionId") Long positionId) {
        Position position = positionService.getById(positionId);
        if (position == null) {
            return ApiResponse.error(404, "职位不存在");
        }

        // 软删除：设置状态为INACTIVE
        position.setStatus(OrgStatus.INACTIVE.getCode());
        positionService.updateById(position);
        return ApiResponse.success("删除成功", null);
    }

    /**
     * 转换为响应对象
     */
    private PositionResponse convertToResponse(Position position) {
        PositionResponse response = new PositionResponse();
        BeanUtils.copyProperties(position, response);

        // 填充三级机构信息
        if (position.getThirdOrgId() != null) {
            Organization thirdOrg = organizationService.getById(position.getThirdOrgId());
            if (thirdOrg != null) {
                response.setThirdOrgName(thirdOrg.getOrgName());

                // 构建机构全路径
                if (thirdOrg.getParentId() != null) {
                    Organization secondOrg = organizationService.getById(thirdOrg.getParentId());
                    if (secondOrg != null && secondOrg.getParentId() != null) {
                        Organization firstOrg = organizationService.getById(secondOrg.getParentId());
                        if (firstOrg != null) {
                            response.setOrgFullPath(
                                    firstOrg.getOrgName() + "/" + secondOrg.getOrgName() + "/" + thirdOrg.getOrgName()
                            );
                        }
                    }
                }
            }
        }

        return response;
    }
}

