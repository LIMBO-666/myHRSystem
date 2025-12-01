package com.example.storage.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.common.entity.EmployeeArchive;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 员工档案表 Service 接口
 */
public interface EmployeeArchiveService extends IService<EmployeeArchive> {
    /**
     * 根据三级机构ID查询员工档案列表
     *
     * @param thirdOrgId 三级机构ID
     * @return 员工档案列表
     */
    List<EmployeeArchive> getByThirdOrgId(Long thirdOrgId);

    /**
     * 根据状态查询员工档案列表
     *
     * @param status 状态：PENDING_REVIEW(待复核), NORMAL(正常), DELETED(已删除)
     * @return 员工档案列表
     */
    List<EmployeeArchive> getByStatus(String status);

    /**
     * 根据职位ID查询员工档案列表
     *
     * @param positionId 职位ID
     * @return 员工档案列表
     */
    List<EmployeeArchive> getByPositionId(Long positionId);

    /**
     * 获取待复核的员工档案列表
     *
     * @return 待复核的员工档案列表
     */
    List<EmployeeArchive> getPendingReview();

    /**
     * 获取正常的员工档案列表
     *
     * @return 正常的员工档案列表
     */
    List<EmployeeArchive> getNormal();

    /**
     * 获取已删除的员工档案列表
     *
     * @return 已删除的员工档案列表
     */
    List<EmployeeArchive> getDeleted();

    /**
     * 根据档案编号查询
     *
     * @param archiveNumber 档案编号
     * @return 员工档案
     */
    EmployeeArchive getByArchiveNumber(String archiveNumber);

    /**
     * 根据登记时间范围查询
     *
     * @param startTime 开始时间
     * @param endTime   结束时间
     * @return 员工档案列表
     */
    List<EmployeeArchive> getByRegistrationTimeRange(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 软删除员工档案
     *
     * @param archiveId   档案ID
     * @param deleteReason 删除原因
     * @return 是否删除成功
     */
    boolean softDelete(Long archiveId, String deleteReason);

    /**
     * 恢复已删除的员工档案
     *
     * @param archiveId 档案ID
     * @return 是否恢复成功
     */
    boolean restore(Long archiveId);

    /**
     * 分页获取已删除的员工档案列表
     *
     * @param page 页码（从1开始）
     * @param size 每页数量
     * @return 分页结果
     */
    com.baomidou.mybatisplus.core.metadata.IPage<EmployeeArchive> getDeletedPage(int page, int size);

    /**
     * 创建员工档案
     *
     * @param archive 员工档案实体
     * @param registrarId 登记人ID
     * @return 创建成功的员工档案
     */
    EmployeeArchive createEmployeeArchive(EmployeeArchive archive, Long registrarId);

    /**
     * 分页获取待复核的员工档案列表
     *
     * @param page 页码（从1开始）
     * @param size 每页数量
     * @return 分页结果
     */
    com.baomidou.mybatisplus.core.metadata.IPage<EmployeeArchive> getPendingReviewPage(int page, int size);

    /**
     * 复核通过（不修改信息）
     *
     * @param archiveId 档案ID
     * @param reviewerId 复核人ID
     * @param reviewComments 复核意见
     * @return 是否成功
     */
    boolean approveReview(Long archiveId, Long reviewerId, String reviewComments);

    /**
     * 复核通过（修改后通过）
     *
     * @param archiveId 档案ID
     * @param archive 修改后的档案信息（不包含档案编号、所属机构、职位）
     * @param reviewerId 复核人ID
     * @param reviewComments 复核意见
     * @return 是否成功
     */
    boolean approveReviewWithUpdate(Long archiveId, EmployeeArchive archive, Long reviewerId, String reviewComments);

    /**
     * 分页查询员工档案（支持多条件查询）
     *
     * @param firstOrgId 一级机构ID（可选）
     * @param secondOrgId 二级机构ID（可选）
     * @param thirdOrgId 三级机构ID（可选）
     * @param positionId 职位ID（可选）
     * @param startDate 建档起始日期（可选）
     * @param endDate 建档结束日期（可选）
     * @param status 状态（可选）
     * @param page 页码（从1开始）
     * @param size 每页数量
     * @return 分页结果
     */
    com.baomidou.mybatisplus.core.metadata.IPage<EmployeeArchive> queryEmployeeArchives(
            Long firstOrgId,
            Long secondOrgId,
            Long thirdOrgId,
            Long positionId,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate,
            String status,
            int page,
            int size
    );

    /**
     * 更新员工档案
     * 档案编号、所属机构和职位不能修改
     * 更新后状态变为待复核
     *
     * @param archiveId 档案ID
     * @param archive 更新后的档案信息（不包含档案编号、所属机构、职位）
     * @return 更新后的员工档案
     */
    EmployeeArchive updateEmployeeArchive(Long archiveId, EmployeeArchive archive);

    /**
     * 更新员工照片URL
     *
     * @param archiveId 档案ID
     * @param photoUrl 照片URL
     * @return 是否更新成功
     */
    boolean updatePhotoUrl(Long archiveId, String photoUrl);
}

