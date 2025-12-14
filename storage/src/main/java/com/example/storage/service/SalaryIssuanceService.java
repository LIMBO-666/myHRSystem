package com.example.storage.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.common.dto.CreateSalaryIssuanceRequest;
import com.example.common.dto.ReviewApproveIssuanceRequest;
import com.example.common.entity.SalaryIssuance;

import java.time.LocalDate;
import java.util.List;

/**
 * 薪酬发放单表 Service 接口
 */
public interface SalaryIssuanceService extends IService<SalaryIssuance> {
    /**
     * 根据三级机构ID和发放月份查询薪酬发放单
     *
     * @param thirdOrgId   三级机构ID
     * @param issuanceMonth 发放月份
     * @return 薪酬发放单
     */
    SalaryIssuance getByThirdOrgIdAndMonth(Long thirdOrgId, LocalDate issuanceMonth);

    /**
     * 根据状态查询薪酬发放单列表
     *
     * @param status 状态：PENDING_REGISTRATION(待登记), PENDING_REVIEW(待复核), EXECUTED(执行), PAID(已付款)
     * @return 薪酬发放单列表
     */
    List<SalaryIssuance> getByStatus(String status);

    /**
     * 获取待登记的薪酬发放单列表
     *
     * @return 待登记的薪酬发放单列表
     */
    List<SalaryIssuance> getPendingRegistration();

    /**
     * 获取待复核的薪酬发放单列表
     *
     * @return 待复核的薪酬发放单列表
     */
    List<SalaryIssuance> getPendingReview();

    /**
     * 获取已执行的薪酬发放单列表
     *
     * @return 已执行的薪酬发放单列表
     */
    List<SalaryIssuance> getExecuted();

    /**
     * 根据薪酬单号查询
     *
     * @param salarySlipNumber 薪酬单号
     * @return 薪酬发放单
     */
    SalaryIssuance getBySalarySlipNumber(String salarySlipNumber);

    /**
     * 获取待登记薪酬发放单列表（按三级机构分组）
     *
     * @param issuanceMonth 发放月份（可选，默认当前月份）
     * @param thirdOrgId    三级机构ID（可选）
     * @return 待登记列表
     */
    List<com.example.common.dto.PendingRegistrationResponse> getPendingRegistrationList(String issuanceMonth, Long thirdOrgId);

    /**
     * 创建薪酬发放单
     *
     * @param request     创建请求
     * @param registrarId 登记人ID
     * @return 薪酬发放单
     */
    SalaryIssuance createSalaryIssuance(CreateSalaryIssuanceRequest request, Long registrarId);

    /**
     * 复核通过薪酬发放单
     *
     * @param issuanceId 薪酬发放单ID
     * @param reviewerId 复核人ID
     * @param request    复核请求（可修改明细）
     * @return 是否成功
     */
    boolean approveReview(Long issuanceId, Long reviewerId, ReviewApproveIssuanceRequest request);

    /**
     * 复核驳回薪酬发放单
     *
     * @param issuanceId   薪酬发放单ID
     * @param reviewerId   复核人ID
     * @param rejectReason 驳回原因
     * @return 是否成功
     */
    boolean rejectReview(Long issuanceId, Long reviewerId, String rejectReason);

    /**
     * 分页查询薪酬发放单
     *
     * @param salarySlipNumber 薪酬单号（可选，支持模糊查询）
     * @param keyword          关键字（可选，在机构名称等字段中匹配）
     * @param startDate        发放起始日期（可选）
     * @param endDate          发放结束日期（可选）
     * @param status           状态（可选）
     * @param thirdOrgId       三级机构ID（可选）
     * @param page             页码
     * @param size             每页数量
     * @return 分页结果
     */
    IPage<SalaryIssuance> querySalaryIssuances(String salarySlipNumber, String keyword, LocalDate startDate,
                                                LocalDate endDate, String status, Long thirdOrgId,
                                                int page, int size);

    /**
     * 获取待复核薪酬发放单分页列表
     *
     * @param issuanceMonth 发放月份（可选，格式：yyyy-MM）
     * @param page 页码
     * @param size 每页数量
     * @return 分页结果
     */
    IPage<SalaryIssuance> getPendingReviewPage(String issuanceMonth, int page, int size);

    /**
     * 获取用于登记的员工明细列表
     * 根据三级机构ID和发放月份获取员工明细（包含薪酬标准信息）
     *
     * @param thirdOrgId    三级机构ID
     * @param issuanceMonth 发放月份（可选，默认当前月份）
     * @return 员工明细列表
     */
    List<com.example.common.dto.SalaryIssuanceDetailResponse> getRegistrationDetails(Long thirdOrgId, String issuanceMonth);
}

