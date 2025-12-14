package com.example.storage.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.common.entity.Organization;
import com.example.storage.mapper.OrganizationMapper;
import com.example.storage.service.OrganizationService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 机构表 Service 实现类
 */
@Service
public class OrganizationServiceImpl extends ServiceImpl<OrganizationMapper, Organization> implements OrganizationService {

    @Override
    public List<Organization> getByParentId(Long parentId) {
        LambdaQueryWrapper<Organization> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Organization::getParentId, parentId);
        return list(wrapper);
    }

    @Override
    public List<Organization> getByOrgLevel(Integer orgLevel) {
        LambdaQueryWrapper<Organization> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Organization::getOrgLevel, orgLevel);
        return list(wrapper);
    }

    @Override
    public List<Organization> getFirstLevelOrgs() {
        return getByOrgLevel(1);
    }

    @Override
    public List<Organization> getSecondLevelOrgs(Long firstOrgId) {
        LambdaQueryWrapper<Organization> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Organization::getOrgLevel, 2)
               .eq(Organization::getParentId, firstOrgId);
        return list(wrapper);
    }

    @Override
    public List<Organization> getThirdLevelOrgs(Long secondOrgId) {
        LambdaQueryWrapper<Organization> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Organization::getOrgLevel, 3)
               .eq(Organization::getParentId, secondOrgId);
        return list(wrapper);
    }

    @Override
    public List<Organization> getThirdLevelOrgsByFirstOrgId(Long firstOrgId) {
        // 1. 获取该一级机构下的所有二级机构
        List<Organization> secondOrgs = getSecondLevelOrgs(firstOrgId);
        if (secondOrgs.isEmpty()) {
            return new ArrayList<>();
        }

        // 2. 获取所有二级机构的ID
        List<Long> secondOrgIds = secondOrgs.stream()
                .map(Organization::getOrgId)
                .collect(Collectors.toList());

        // 3. 查询这些二级机构下的所有三级机构
        LambdaQueryWrapper<Organization> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Organization::getOrgLevel, 3)
               .in(Organization::getParentId, secondOrgIds);
        return list(wrapper);
    }
}

