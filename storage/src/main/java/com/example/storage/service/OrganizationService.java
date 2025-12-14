package com.example.storage.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.common.entity.Organization;

import java.util.List;

/**
 * 机构表 Service 接口
 */
public interface OrganizationService extends IService<Organization> {
    /**
     * 根据父机构ID查询子机构列表
     *
     * @param parentId 父机构ID
     * @return 子机构列表
     */
    List<Organization> getByParentId(Long parentId);

    /**
     * 根据机构级别查询机构列表
     *
     * @param orgLevel 机构级别：1(一级机构), 2(二级机构), 3(三级机构)
     * @return 机构列表
     */
    List<Organization> getByOrgLevel(Integer orgLevel);

    /**
     * 获取一级机构列表
     *
     * @return 一级机构列表
     */
    List<Organization> getFirstLevelOrgs();

    /**
     * 获取二级机构列表（根据一级机构ID）
     *
     * @param firstOrgId 一级机构ID
     * @return 二级机构列表
     */
    List<Organization> getSecondLevelOrgs(Long firstOrgId);

    /**
     * 获取三级机构列表（根据二级机构ID）
     *
     * @param secondOrgId 二级机构ID
     * @return 三级机构列表
     */
    List<Organization> getThirdLevelOrgs(Long secondOrgId);

    /**
     * 获取一级机构下的所有三级机构列表（通过二级机构）
     *
     * @param firstOrgId 一级机构ID
     * @return 三级机构列表
     */
    List<Organization> getThirdLevelOrgsByFirstOrgId(Long firstOrgId);
}

