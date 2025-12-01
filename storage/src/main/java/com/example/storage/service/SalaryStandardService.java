package com.example.storage.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.common.dto.CreateSalaryStandardRequest;
import com.example.common.dto.UpdateSalaryStandardRequest;
import com.example.common.entity.SalaryStandard;

import java.time.LocalDate;
import java.util.List;

/**
 * 薪酬标准表 Service 接口
 */
public interface SalaryStandardService extends IService<SalaryStandard> {
    /**
     * 根据职位ID和职称查询薪酬标准
     *
     * @param positionId 职位ID
     * @param jobTitle   职称：JUNIOR(初级), INTERMEDIATE(中级), SENIOR(高级)
     * @return 薪酬标准
     */
    SalaryStandard getByPositionIdAndJobTitle(Long positionId, String jobTitle);

    /**
     * 根据状态查询薪酬标准列表
     *
     * @param status 状态：PENDING_REVIEW(待复核), APPROVED(已通过), REJECTED(已驳回)
     * @return 薪酬标准列表
     */
    List<SalaryStandard> getByStatus(String status);

    /**
     * 获取待复核的薪酬标准列表
     *
     * @return 待复核的薪酬标准列表
     */
    List<SalaryStandard> getPendingReview();

    /**
     * 获取已通过的薪酬标准列表
     *
     * @return 已通过的薪酬标准列表
     */
    List<SalaryStandard> getApproved();

    /**
     * 根据薪酬标准编号查询
     *
     * @param standardCode 薪酬标准编号
     * @return 薪酬标准
     */
    SalaryStandard getByStandardCode(String standardCode);

    /**
     * 创建薪酬标准
     *
     * @param request     创建请求
     * @param registrarId 登记人ID
     * @return 薪酬标准
     */
    SalaryStandard createSalaryStandard(CreateSalaryStandardRequest request, Long registrarId);

    /**
     * 更新薪酬标准
     *
     * @param standardId 薪酬标准ID
     * @param request     更新请求
     * @return 薪酬标准
     */
    SalaryStandard updateSalaryStandard(Long standardId, UpdateSalaryStandardRequest request);

    /**
     * 复核通过薪酬标准
     *
     * @param standardId    薪酬标准ID
     * @param reviewerId    复核人ID
     * @param reviewComments 复核意见
     * @return 是否成功
     */
    boolean approveReview(Long standardId, Long reviewerId, String reviewComments);

    /**
     * 复核驳回薪酬标准
     *
     * @param standardId    薪酬标准ID
     * @param reviewerId    复核人ID
     * @param reviewComments 复核意见
     * @return 是否成功
     */
    boolean rejectReview(Long standardId, Long reviewerId, String reviewComments);

    /**
     * 根据职位ID和职称获取已通过的薪酬标准
     *
     * @param positionId 职位ID
     * @param jobTitle   职称
     * @return 薪酬标准
     */
    SalaryStandard getApprovedByPositionIdAndJobTitle(Long positionId, String jobTitle);

    /**
     * 分页查询薪酬标准
     *
     * @param standardCode 薪酬标准编号（可选，支持模糊查询）
     * @param keyword       关键字（可选，在标准名称、制定人、变更人、复核人字段中匹配）
     * @param startDate     登记起始日期（可选）
     * @param endDate       登记结束日期（可选）
     * @param status        状态（可选）
     * @param positionId    职位ID（可选）
     * @param jobTitle       职称（可选）
     * @param page          页码
     * @param size          每页数量
     * @return 分页结果
     */
    IPage<SalaryStandard> querySalaryStandards(String standardCode, String keyword, LocalDate startDate,
                                                LocalDate endDate, String status, Long positionId, String jobTitle,
                                                int page, int size);

    /**
     * 获取待复核薪酬标准分页列表
     *
     * @param page 页码
     * @param size 每页数量
     * @return 分页结果
     */
    IPage<SalaryStandard> getPendingReviewPage(int page, int size);
}

