package com.example.storage.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.common.entity.Position;

import java.util.List;

/**
 * 职位表 Service 接口
 */
public interface PositionService extends IService<Position> {
    /**
     * 根据三级机构ID查询职位列表
     *
     * @param thirdOrgId 三级机构ID
     * @return 职位列表
     */
    List<Position> getByThirdOrgId(Long thirdOrgId);

    /**
     * 根据职位名称查询职位
     *
     * @param positionName 职位名称
     * @return 职位信息
     */
    Position getByPositionName(String positionName);

    /**
     * 根据一级机构ID查询职位列表（查询该一级机构下所有三级机构的职位）
     *
     * @param firstOrgId 一级机构ID
     * @return 职位列表
     */
    List<Position> getByFirstOrgId(Long firstOrgId);

    /**
     * 根据二级机构ID查询职位列表（查询该二级机构下所有三级机构的职位）
     *
     * @param secondOrgId 二级机构ID
     * @return 职位列表
     */
    List<Position> getBySecondOrgId(Long secondOrgId);
}

