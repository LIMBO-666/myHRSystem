package com.example.storage.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.common.entity.Organization;
import com.example.common.entity.Position;
import com.example.storage.mapper.PositionMapper;
import com.example.storage.service.OrganizationService;
import com.example.storage.service.PositionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 职位表 Service 实现类
 */
@Service
public class PositionServiceImpl extends ServiceImpl<PositionMapper, Position> implements PositionService {

    @Autowired
    private OrganizationService organizationService;

    @Override
    public List<Position> getByThirdOrgId(Long thirdOrgId) {
        LambdaQueryWrapper<Position> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Position::getThirdOrgId, thirdOrgId);
        return list(wrapper);
    }

    @Override
    public Position getByPositionName(String positionName) {
        LambdaQueryWrapper<Position> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Position::getPositionName, positionName);
        return getOne(wrapper);
    }

    @Override
    public List<Position> getByFirstOrgId(Long firstOrgId) {
        // 1. 获取该一级机构下的所有二级机构
        List<Organization> secondOrgs = organizationService.getSecondLevelOrgs(firstOrgId);
        if (secondOrgs.isEmpty()) {
            return new ArrayList<>();
        }

        // 2. 获取所有二级机构下的三级机构ID
        List<Long> thirdOrgIds = new ArrayList<>();
        for (Organization secondOrg : secondOrgs) {
            List<Organization> thirdOrgs = organizationService.getThirdLevelOrgs(secondOrg.getOrgId());
            thirdOrgIds.addAll(thirdOrgs.stream()
                    .map(Organization::getOrgId)
                    .collect(Collectors.toList()));
        }

        if (thirdOrgIds.isEmpty()) {
            return new ArrayList<>();
        }

        // 3. 查询这些三级机构下的所有职位
        LambdaQueryWrapper<Position> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(Position::getThirdOrgId, thirdOrgIds);
        return list(wrapper);
    }

    @Override
    public List<Position> getBySecondOrgId(Long secondOrgId) {
        // 1. 获取该二级机构下的所有三级机构
        List<Organization> thirdOrgs = organizationService.getThirdLevelOrgs(secondOrgId);
        if (thirdOrgs.isEmpty()) {
            return new ArrayList<>();
        }

        // 2. 获取所有三级机构ID
        List<Long> thirdOrgIds = thirdOrgs.stream()
                .map(Organization::getOrgId)
                .collect(Collectors.toList());

        // 3. 查询这些三级机构下的所有职位
        LambdaQueryWrapper<Position> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(Position::getThirdOrgId, thirdOrgIds);
        return list(wrapper);
    }
}

