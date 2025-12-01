package com.example.storage.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.common.dto.CreateSalaryIssuanceRequest;
import com.example.common.dto.PendingRegistrationResponse;
import com.example.common.dto.ReviewApproveIssuanceRequest;
import com.example.common.dto.SalaryIssuanceDetailRequest;
import com.example.common.dto.SalaryIssuanceDetailUpdateRequest;
import com.example.common.entity.*;
import com.example.common.enums.EmployeeArchiveStatus;
import com.example.common.enums.SalaryIssuanceStatus;
import com.example.storage.mapper.SalaryIssuanceMapper;
import com.example.storage.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 薪酬发放单表 Service 实现类
 */
@Service
@RequiredArgsConstructor
public class SalaryIssuanceServiceImpl extends ServiceImpl<SalaryIssuanceMapper, SalaryIssuance> implements SalaryIssuanceService {

    private final EmployeeArchiveService employeeArchiveService;
    private final SalaryStandardService salaryStandardService;
    private final SalaryStandardItemService salaryStandardItemService;
    private final SalaryIssuanceDetailService salaryIssuanceDetailService;
    private final OrganizationService organizationService;
    private final PositionService positionService;
    private final SalaryItemService salaryItemService;

    @Override
    public SalaryIssuance getByThirdOrgIdAndMonth(Long thirdOrgId, LocalDate issuanceMonth) {
        LambdaQueryWrapper<SalaryIssuance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SalaryIssuance::getThirdOrgId, thirdOrgId)
               .eq(SalaryIssuance::getIssuanceMonth, issuanceMonth);
        return getOne(wrapper);
    }

    @Override
    public List<SalaryIssuance> getByStatus(String status) {
        LambdaQueryWrapper<SalaryIssuance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SalaryIssuance::getStatus, status);
        return list(wrapper);
    }

    @Override
    public List<SalaryIssuance> getPendingRegistration() {
        return getByStatus(SalaryIssuanceStatus.PENDING_REGISTRATION.getCode());
    }

    @Override
    public List<SalaryIssuance> getPendingReview() {
        return getByStatus(SalaryIssuanceStatus.PENDING_REVIEW.getCode());
    }

    @Override
    public List<SalaryIssuance> getExecuted() {
        return getByStatus(SalaryIssuanceStatus.EXECUTED.getCode());
    }

    @Override
    public SalaryIssuance getBySalarySlipNumber(String salarySlipNumber) {
        LambdaQueryWrapper<SalaryIssuance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SalaryIssuance::getSalarySlipNumber, salarySlipNumber);
        return getOne(wrapper);
    }

    @Override
    public List<PendingRegistrationResponse> getPendingRegistrationList(String issuanceMonth, Long thirdOrgId) {
        // 解析发放月份
        LocalDate monthDate;
        if (issuanceMonth != null && !issuanceMonth.trim().isEmpty()) {
            YearMonth yearMonth = YearMonth.parse(issuanceMonth);
            monthDate = yearMonth.atDay(1);
        } else {
            monthDate = LocalDate.now().withDayOfMonth(1);
        }

        // 获取所有三级机构
        List<Organization> thirdOrgs;
        if (thirdOrgId != null) {
            Organization org = organizationService.getById(thirdOrgId);
            if (org != null && org.getOrgLevel() == 3) {
                thirdOrgs = List.of(org);
            } else {
                thirdOrgs = new ArrayList<>();
            }
        } else {
            thirdOrgs = organizationService.getByOrgLevel(3);
        }

        List<PendingRegistrationResponse> result = new ArrayList<>();

        for (Organization thirdOrg : thirdOrgs) {
            // 检查该机构该月份是否已有薪酬发放单
            SalaryIssuance existing = getByThirdOrgIdAndMonth(thirdOrg.getOrgId(), monthDate);
            if (existing != null && !SalaryIssuanceStatus.PENDING_REGISTRATION.getCode().equals(existing.getStatus())) {
                // 已登记或已复核，跳过
                continue;
            }

            // 查询该机构下正常状态的员工
            List<EmployeeArchive> employees = employeeArchiveService.getByThirdOrgId(thirdOrg.getOrgId());
            employees = employees.stream()
                    .filter(e -> EmployeeArchiveStatus.NORMAL.getCode().equals(e.getStatus()))
                    .filter(e -> e.getSalaryStandardId() != null)
                    .collect(Collectors.toList());

            if (employees.isEmpty()) {
                continue;
            }

            // 计算基本工资总额
            BigDecimal totalBasicSalary = BigDecimal.ZERO;
            for (EmployeeArchive employee : employees) {
                if (employee.getSalaryStandardId() != null) {
                    SalaryStandard standard = salaryStandardService.getById(employee.getSalaryStandardId());
                    if (standard != null) {
                        List<SalaryStandardItem> items = salaryStandardItemService.getByStandardId(standard.getStandardId());
                        for (SalaryStandardItem item : items) {
                            SalaryItem salaryItem = salaryItemService.getById(item.getItemId());
                            if (salaryItem != null && "S001".equals(salaryItem.getItemCode())) {
                                // 基本工资
                                totalBasicSalary = totalBasicSalary.add(item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO);
                                break;
                            }
                        }
                    }
                }
            }

            PendingRegistrationResponse response = new PendingRegistrationResponse();
            response.setThirdOrgId(thirdOrg.getOrgId());
            response.setThirdOrgName(thirdOrg.getOrgName());
            response.setTotalEmployees(employees.size());
            response.setTotalBasicSalary(totalBasicSalary);
            response.setStatus(existing != null ? existing.getStatus() : SalaryIssuanceStatus.PENDING_REGISTRATION.getCode());
            if (existing != null) {
                response.setSalarySlipNumber(existing.getSalarySlipNumber());
            }

            // 构建机构全路径
            String orgFullPath = buildOrgFullPath(thirdOrg);
            response.setOrgFullPath(orgFullPath);

            result.add(response);
        }

        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SalaryIssuance createSalaryIssuance(CreateSalaryIssuanceRequest request, Long registrarId) {
        // 解析发放月份
        YearMonth yearMonth = YearMonth.parse(request.getIssuanceMonth());
        LocalDate monthDate = yearMonth.atDay(1);

        // 检查是否已存在
        SalaryIssuance existing = getByThirdOrgIdAndMonth(request.getThirdOrgId(), monthDate);
        if (existing != null && !SalaryIssuanceStatus.PENDING_REGISTRATION.getCode().equals(existing.getStatus())) {
            throw new RuntimeException("该机构该月份已存在薪酬发放单");
        }

        // 生成薪酬单号
        String salarySlipNumber = generateSalarySlipNumber();

        SalaryIssuance issuance;
        if (existing != null) {
            issuance = existing;
            issuance.setSalarySlipNumber(salarySlipNumber);
        } else {
            issuance = new SalaryIssuance();
            issuance.setSalarySlipNumber(salarySlipNumber);
            issuance.setThirdOrgId(request.getThirdOrgId());
            issuance.setIssuanceMonth(monthDate);
            issuance.setStatus(SalaryIssuanceStatus.PENDING_REVIEW.getCode());
        }

        issuance.setRegistrarId(registrarId);
        issuance.setRegistrationTime(LocalDateTime.now());

        // 保存薪酬发放单
        saveOrUpdate(issuance);

        // 删除旧的明细
        salaryIssuanceDetailService.deleteByIssuanceId(issuance.getIssuanceId());

        // 创建明细并计算总额
        BigDecimal totalBasicSalary = BigDecimal.ZERO;
        BigDecimal totalNetPay = BigDecimal.ZERO;
        int totalEmployees = 0;

        for (SalaryIssuanceDetailRequest detailRequest : request.getDetails()) {
            EmployeeArchive employee = employeeArchiveService.getById(detailRequest.getEmployeeId());
            if (employee == null || !EmployeeArchiveStatus.NORMAL.getCode().equals(employee.getStatus())) {
                continue;
            }

            SalaryIssuanceDetail detail = createSalaryIssuanceDetail(
                    issuance.getIssuanceId(),
                    employee,
                    detailRequest.getAwardAmount() != null ? detailRequest.getAwardAmount() : BigDecimal.ZERO,
                    detailRequest.getDeductionAmount() != null ? detailRequest.getDeductionAmount() : BigDecimal.ZERO
            );

            salaryIssuanceDetailService.save(detail);

            totalBasicSalary = totalBasicSalary.add(detail.getBasicSalary() != null ? detail.getBasicSalary() : BigDecimal.ZERO);
            totalNetPay = totalNetPay.add(detail.getNetPay() != null ? detail.getNetPay() : BigDecimal.ZERO);
            totalEmployees++;
        }

        issuance.setTotalEmployees(totalEmployees);
        issuance.setTotalBasicSalary(totalBasicSalary);
        issuance.setTotalNetPay(totalNetPay);
        updateById(issuance);

        return issuance;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean approveReview(Long issuanceId, Long reviewerId, ReviewApproveIssuanceRequest request) {
        SalaryIssuance issuance = getById(issuanceId);
        if (issuance == null) {
            throw new RuntimeException("薪酬发放单不存在");
        }
        if (!SalaryIssuanceStatus.PENDING_REVIEW.getCode().equals(issuance.getStatus())) {
            throw new RuntimeException("薪酬发放单状态不是待复核，无法进行复核操作");
        }

        // 更新明细（如果提供了）
        if (request.getDetails() != null && !request.getDetails().isEmpty()) {
            for (SalaryIssuanceDetailUpdateRequest detailUpdate : request.getDetails()) {
                SalaryIssuanceDetail detail = salaryIssuanceDetailService.getById(detailUpdate.getDetailId());
                if (detail != null) {
                    if (detailUpdate.getAwardAmount() != null) {
                        detail.setAwardAmount(detailUpdate.getAwardAmount());
                    }
                    if (detailUpdate.getDeductionAmount() != null) {
                        detail.setDeductionAmount(detailUpdate.getDeductionAmount());
                    }

                    // 重新计算
                    recalculateDetail(detail);
                    salaryIssuanceDetailService.updateById(detail);
                }
            }
        }

        // 重新计算总额
        recalculateIssuance(issuanceId);

        // 更新状态
        LambdaUpdateWrapper<SalaryIssuance> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(SalaryIssuance::getIssuanceId, issuanceId)
               .set(SalaryIssuance::getStatus, SalaryIssuanceStatus.EXECUTED.getCode())
               .set(SalaryIssuance::getReviewerId, reviewerId)
               .set(SalaryIssuance::getReviewTime, LocalDateTime.now());

        return update(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean rejectReview(Long issuanceId, Long reviewerId, String rejectReason) {
        SalaryIssuance issuance = getById(issuanceId);
        if (issuance == null) {
            throw new RuntimeException("薪酬发放单不存在");
        }
        if (!SalaryIssuanceStatus.PENDING_REVIEW.getCode().equals(issuance.getStatus())) {
            throw new RuntimeException("薪酬发放单状态不是待复核，无法进行复核操作");
        }

        LambdaUpdateWrapper<SalaryIssuance> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(SalaryIssuance::getIssuanceId, issuanceId)
               .set(SalaryIssuance::getStatus, SalaryIssuanceStatus.REJECTED.getCode())
               .set(SalaryIssuance::getReviewerId, reviewerId)
               .set(SalaryIssuance::getReviewTime, LocalDateTime.now())
               .set(SalaryIssuance::getRejectReason, rejectReason);

        return update(wrapper);
    }

    @Override
    public IPage<SalaryIssuance> querySalaryIssuances(String salarySlipNumber, String keyword, LocalDate startDate,
                                                       LocalDate endDate, String status, Long thirdOrgId,
                                                       int page, int size) {
        Page<SalaryIssuance> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<SalaryIssuance> wrapper = new LambdaQueryWrapper<>();

        // 薪酬单号模糊查询
        if (salarySlipNumber != null && !salarySlipNumber.trim().isEmpty()) {
            wrapper.like(SalaryIssuance::getSalarySlipNumber, salarySlipNumber);
        }

        // 关键字查询（暂时只支持薪酬单号）
        if (keyword != null && !keyword.trim().isEmpty()) {
            wrapper.and(w -> w.like(SalaryIssuance::getSalarySlipNumber, keyword));
        }

        // 发放时间范围查询
        if (startDate != null) {
            wrapper.ge(SalaryIssuance::getIssuanceMonth, startDate);
        }
        if (endDate != null) {
            wrapper.le(SalaryIssuance::getIssuanceMonth, endDate);
        }

        // 状态查询
        if (status != null && !status.trim().isEmpty()) {
            wrapper.eq(SalaryIssuance::getStatus, status);
        }

        // 三级机构ID查询
        if (thirdOrgId != null) {
            wrapper.eq(SalaryIssuance::getThirdOrgId, thirdOrgId);
        }

        wrapper.orderByDesc(SalaryIssuance::getRegistrationTime);

        return page(pageParam, wrapper);
    }

    @Override
    public IPage<SalaryIssuance> getPendingReviewPage(int page, int size) {
        Page<SalaryIssuance> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<SalaryIssuance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SalaryIssuance::getStatus, SalaryIssuanceStatus.PENDING_REVIEW.getCode())
               .orderByDesc(SalaryIssuance::getRegistrationTime);
        return page(pageParam, wrapper);
    }

    /**
     * 创建薪酬发放明细
     */
    private SalaryIssuanceDetail createSalaryIssuanceDetail(Long issuanceId, EmployeeArchive employee,
                                                            BigDecimal awardAmount, BigDecimal deductionAmount) {
        SalaryIssuanceDetail detail = new SalaryIssuanceDetail();
        detail.setIssuanceId(issuanceId);
        detail.setEmployeeId(employee.getArchiveId());
        detail.setEmployeeNumber(employee.getArchiveNumber());
        detail.setEmployeeName(employee.getName());

        // 设置职位名称
        if (employee.getPositionId() != null) {
            Position position = positionService.getById(employee.getPositionId());
            if (position != null) {
                detail.setPositionName(position.getPositionName());
            }
        }

        // 从薪酬标准获取各项目金额
        if (employee.getSalaryStandardId() != null) {
            SalaryStandard standard = salaryStandardService.getById(employee.getSalaryStandardId());
            if (standard != null) {
                List<SalaryStandardItem> standardItems = salaryStandardItemService.getByStandardId(standard.getStandardId());
                List<SalaryItem> salaryItems = salaryItemService.list();

                Map<Long, SalaryItem> salaryItemMap = salaryItems.stream()
                        .collect(Collectors.toMap(SalaryItem::getItemId, item -> item));

                for (SalaryStandardItem standardItem : standardItems) {
                    SalaryItem salaryItem = salaryItemMap.get(standardItem.getItemId());
                    if (salaryItem != null) {
                        BigDecimal amount = standardItem.getAmount() != null ? standardItem.getAmount() : BigDecimal.ZERO;
                        String itemCode = salaryItem.getItemCode();

                        switch (itemCode) {
                            case "S001": // 基本工资
                                detail.setBasicSalary(amount);
                                break;
                            case "S002": // 绩效奖金
                                detail.setPerformanceBonus(amount);
                                break;
                            case "S003": // 交通补贴
                                detail.setTransportationAllowance(amount);
                                break;
                            case "S004": // 餐费补贴
                                detail.setMealAllowance(amount);
                                break;
                            case "S006": // 养老保险
                                detail.setPensionInsurance(amount);
                                break;
                            case "S007": // 医疗保险
                                detail.setMedicalInsurance(amount);
                                break;
                            case "S008": // 失业保险
                                detail.setUnemploymentInsurance(amount);
                                break;
                            case "S009": // 住房公积金
                                detail.setHousingFund(amount);
                                break;
                        }
                    }
                }
            }
        }

        // 设置奖励金额和应扣金额
        detail.setAwardAmount(awardAmount != null ? awardAmount : BigDecimal.ZERO);
        detail.setDeductionAmount(deductionAmount != null ? deductionAmount : BigDecimal.ZERO);

        // 计算合计
        recalculateDetail(detail);

        return detail;
    }

    /**
     * 重新计算明细的合计
     */
    private void recalculateDetail(SalaryIssuanceDetail detail) {
        // 总收入 = 基本工资 + 绩效奖金 + 交通补贴 + 餐费补贴 + 奖励金额
        BigDecimal totalIncome = BigDecimal.ZERO;
        totalIncome = totalIncome.add(detail.getBasicSalary() != null ? detail.getBasicSalary() : BigDecimal.ZERO);
        totalIncome = totalIncome.add(detail.getPerformanceBonus() != null ? detail.getPerformanceBonus() : BigDecimal.ZERO);
        totalIncome = totalIncome.add(detail.getTransportationAllowance() != null ? detail.getTransportationAllowance() : BigDecimal.ZERO);
        totalIncome = totalIncome.add(detail.getMealAllowance() != null ? detail.getMealAllowance() : BigDecimal.ZERO);
        totalIncome = totalIncome.add(detail.getAwardAmount() != null ? detail.getAwardAmount() : BigDecimal.ZERO);
        detail.setTotalIncome(totalIncome.setScale(2, RoundingMode.HALF_UP));

        // 总扣除 = 养老保险 + 医疗保险 + 失业保险 + 住房公积金 + 应扣金额
        BigDecimal totalDeduction = BigDecimal.ZERO;
        totalDeduction = totalDeduction.add(detail.getPensionInsurance() != null ? detail.getPensionInsurance() : BigDecimal.ZERO);
        totalDeduction = totalDeduction.add(detail.getMedicalInsurance() != null ? detail.getMedicalInsurance() : BigDecimal.ZERO);
        totalDeduction = totalDeduction.add(detail.getUnemploymentInsurance() != null ? detail.getUnemploymentInsurance() : BigDecimal.ZERO);
        totalDeduction = totalDeduction.add(detail.getHousingFund() != null ? detail.getHousingFund() : BigDecimal.ZERO);
        totalDeduction = totalDeduction.add(detail.getDeductionAmount() != null ? detail.getDeductionAmount() : BigDecimal.ZERO);
        detail.setTotalDeduction(totalDeduction.setScale(2, RoundingMode.HALF_UP));

        // 实发金额 = 总收入 - 总扣除
        BigDecimal netPay = totalIncome.subtract(totalDeduction);
        detail.setNetPay(netPay.setScale(2, RoundingMode.HALF_UP));
    }

    /**
     * 重新计算薪酬发放单的总额
     */
    private void recalculateIssuance(Long issuanceId) {
        List<SalaryIssuanceDetail> details = salaryIssuanceDetailService.getByIssuanceId(issuanceId);

        BigDecimal totalBasicSalary = BigDecimal.ZERO;
        BigDecimal totalNetPay = BigDecimal.ZERO;
        int totalEmployees = details.size();

        for (SalaryIssuanceDetail detail : details) {
            totalBasicSalary = totalBasicSalary.add(detail.getBasicSalary() != null ? detail.getBasicSalary() : BigDecimal.ZERO);
            totalNetPay = totalNetPay.add(detail.getNetPay() != null ? detail.getNetPay() : BigDecimal.ZERO);
        }

        SalaryIssuance issuance = getById(issuanceId);
        if (issuance != null) {
            issuance.setTotalEmployees(totalEmployees);
            issuance.setTotalBasicSalary(totalBasicSalary.setScale(2, RoundingMode.HALF_UP));
            issuance.setTotalNetPay(totalNetPay.setScale(2, RoundingMode.HALF_UP));
            updateById(issuance);
        }
    }

    /**
     * 生成薪酬单号
     * 格式：PAY + 年月（6位）+ 序号（3位）
     * 例如：PAY202307001
     */
    private String generateSalarySlipNumber() {
        LocalDate now = LocalDate.now();
        String yearMonth = String.format("%04d%02d", now.getYear(), now.getMonthValue());

        // 查询当月最大序号
        LambdaQueryWrapper<SalaryIssuance> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(SalaryIssuance::getSalarySlipNumber, "PAY" + yearMonth)
               .orderByDesc(SalaryIssuance::getSalarySlipNumber)
               .last("LIMIT 1");

        SalaryIssuance lastIssuance = getOne(wrapper);
        int sequence = 1;

        if (lastIssuance != null && lastIssuance.getSalarySlipNumber() != null) {
            String lastNumber = lastIssuance.getSalarySlipNumber();
            if (lastNumber.length() >= 12) {
                try {
                    String sequenceStr = lastNumber.substring(9);
                    sequence = Integer.parseInt(sequenceStr) + 1;
                } catch (NumberFormatException e) {
                    sequence = 1;
                }
            }
        }

        return String.format("PAY%s%03d", yearMonth, sequence);
    }

    /**
     * 构建机构全路径
     */
    private String buildOrgFullPath(Organization thirdOrg) {
        if (thirdOrg.getParentId() == null) {
            return thirdOrg.getOrgName();
        }

        Organization secondOrg = organizationService.getById(thirdOrg.getParentId());
        if (secondOrg == null || secondOrg.getParentId() == null) {
            return thirdOrg.getOrgName();
        }

        Organization firstOrg = organizationService.getById(secondOrg.getParentId());
        if (firstOrg == null) {
            return thirdOrg.getOrgName();
        }

        return firstOrg.getOrgName() + "/" + secondOrg.getOrgName() + "/" + thirdOrg.getOrgName();
    }
}

