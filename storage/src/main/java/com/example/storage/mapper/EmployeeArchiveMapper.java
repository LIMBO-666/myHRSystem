package com.example.storage.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.common.entity.EmployeeArchive;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * 员工档案表 Mapper 接口
 */
@Mapper
public interface EmployeeArchiveMapper extends BaseMapper<EmployeeArchive> {
    /**
     * 根据三级机构ID查询员工档案列表
     *
     * @param thirdOrgId 三级机构ID
     * @return 员工档案列表
     */
    List<EmployeeArchive> selectByThirdOrgId(Long thirdOrgId);

    /**
     * 根据状态查询员工档案列表
     *
     * @param status 状态：PENDING_REVIEW(待复核), NORMAL(正常), DELETED(已删除)
     * @return 员工档案列表
     */
    List<EmployeeArchive> selectByStatus(String status);

    /**
     * 根据职位ID查询员工档案列表
     *
     * @param positionId 职位ID
     * @return 员工档案列表
     */
    List<EmployeeArchive> selectByPositionId(Long positionId);

}

