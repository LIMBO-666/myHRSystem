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
import com.example.common.dto.SalaryIssuanceDetailResponse;
import com.example.common.dto.SalaryIssuanceDetailUpdateRequest;
import com.example.common.entity.*;
import com.example.common.enums.EmployeeArchiveStatus;
import com.example.common.enums.SalaryIssuanceStatus;
import com.example.common.enums.SalaryStandardStatus;
import com.example.storage.mapper.SalaryIssuanceMapper;
import com.example.storage.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 薪酬发放单表 Service 实现类
 */
@Service
public class SalaryIssuanceServiceImpl extends ServiceImpl<SalaryIssuanceMapper, SalaryIssuance> implements SalaryIssuanceService {

    @Autowired
    private EmployeeArchiveService employeeArchiveService;
    @Autowired
    private SalaryStandardService salaryStandardService;
    @Autowired
    private SalaryStandardItemService salaryStandardItemService;
    @Autowired
    private SalaryIssuanceDetailService salaryIssuanceDetailService;
    @Autowired
    private OrganizationService organizationService;
    @Autowired
    private PositionService positionService;
    @Autowired
    private SalaryItemService salaryItemService;

    @Override
    public SalaryIssuance getByThirdOrgIdAndMonth(Long thirdOrgId, LocalDate issuanceMonth) {
        LambdaQueryWrapper<SalaryIssuance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SalaryIssuance::getThirdOrgId, thirdOrgId)
               .eq(SalaryIssuance::getIssuanceMonth, issuanceMonth);
        
        // 查询所有匹配的记录
        List<SalaryIssuance> issuances = list(wrapper);
        
        if (issuances.isEmpty()) {
            return null;
        }
        
        // 如果只有一条记录，直接返回
        if (issuances.size() == 1) {
            return issuances.get(0);
        }
        
        // 如果存在多条记录，优先返回可编辑状态的记录
        // 优先级：PENDING_REGISTRATION > PENDING_REVIEW > 其他
        for (SalaryIssuance issuance : issuances) {
            String status = issuance.getStatus();
            if (SalaryIssuanceStatus.PENDING_REGISTRATION.getCode().equals(status)) {
                return issuance;
            }
        }
        
        for (SalaryIssuance issuance : issuances) {
            String status = issuance.getStatus();
            if (SalaryIssuanceStatus.PENDING_REVIEW.getCode().equals(status)) {
                return issuance;
            }
        }
        
        // 如果没有可编辑状态的记录，返回第一条（可能是EXECUTED或PAID）
        return issuances.get(0);
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
        List<PendingRegistrationResponse> result = new ArrayList<>();

        // 如果指定了月份，只查询该月份
        if (issuanceMonth != null && !issuanceMonth.trim().isEmpty()) {
            YearMonth yearMonth = YearMonth.parse(issuanceMonth);
            LocalDate monthDate = yearMonth.atDay(1);

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

            for (Organization thirdOrg : thirdOrgs) {
                // 根据三级机构的创建时间判断：如果机构是在本月或之前创建的，才显示该月份的薪酬发放
                if (thirdOrg.getCreateTime() != null) {
                    LocalDate orgCreateDate = thirdOrg.getCreateTime().toLocalDate();
                    LocalDate orgCreateMonth = orgCreateDate.withDayOfMonth(1);
                    // 如果机构创建月份晚于查询月份，跳过该机构
                    if (orgCreateMonth.isAfter(monthDate)) {
                        continue;
                    }
                }
                
                // 检查该机构该月份是否已有薪酬发放单
                SalaryIssuance existing = getByThirdOrgIdAndMonth(thirdOrg.getOrgId(), monthDate);
                // 只显示待登记和待复核状态的记录
                if (existing != null && 
                    !SalaryIssuanceStatus.PENDING_REGISTRATION.getCode().equals(existing.getStatus()) &&
                    !SalaryIssuanceStatus.PENDING_REVIEW.getCode().equals(existing.getStatus())) {
                    // 已执行或已付款，跳过
                    continue;
                }

                PendingRegistrationResponse response = buildPendingRegistrationResponse(thirdOrg, existing, monthDate);
                if (response != null) {
                    response.setIssuanceMonth(monthDate);
                    result.add(response);
                }
            }
        } else {
            // 如果没有指定月份，查询所有待复核状态的薪酬发放单
            LambdaQueryWrapper<SalaryIssuance> wrapper = new LambdaQueryWrapper<>();
            wrapper.in(SalaryIssuance::getStatus, 
                    SalaryIssuanceStatus.PENDING_REGISTRATION.getCode(),
                    SalaryIssuanceStatus.PENDING_REVIEW.getCode());
            if (thirdOrgId != null) {
                wrapper.eq(SalaryIssuance::getThirdOrgId, thirdOrgId);
            }
            List<SalaryIssuance> issuances = list(wrapper);

            // 按机构分组，每个机构只显示一条记录（优先显示待复核的）
            Map<Long, SalaryIssuance> orgIssuanceMap = new HashMap<>();
            for (SalaryIssuance issuance : issuances) {
                Long orgId = issuance.getThirdOrgId();
                if (!orgIssuanceMap.containsKey(orgId) || 
                    SalaryIssuanceStatus.PENDING_REVIEW.getCode().equals(issuance.getStatus())) {
                    orgIssuanceMap.put(orgId, issuance);
                }
            }

            // 构建响应
            for (Map.Entry<Long, SalaryIssuance> entry : orgIssuanceMap.entrySet()) {
                Organization thirdOrg = organizationService.getById(entry.getKey());
                if (thirdOrg != null) {
                    SalaryIssuance issuance = entry.getValue();
                    PendingRegistrationResponse response = new PendingRegistrationResponse();
                    response.setThirdOrgId(thirdOrg.getOrgId());
                    response.setThirdOrgName(thirdOrg.getOrgName());
                    response.setTotalEmployees(issuance.getTotalEmployees());
                    response.setTotalBasicSalary(issuance.getTotalBasicSalary());
                    response.setStatus(issuance.getStatus());
                    response.setSalarySlipNumber(issuance.getSalarySlipNumber());
                    response.setIssuanceMonth(issuance.getIssuanceMonth());
                    response.setOrgFullPath(buildOrgFullPath(thirdOrg));
                    result.add(response);
                }
            }

            // 对于没有薪酬发放单但需要登记的机构，也添加进去
            // 但需要排除已有 EXECUTED 或 PAID 状态记录的机构
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

            for (Organization thirdOrg : thirdOrgs) {
                if (!orgIssuanceMap.containsKey(thirdOrg.getOrgId())) {
                    // 检查该机构当前月份是否已有 EXECUTED 或 PAID 状态的记录
                    LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
                    SalaryIssuance existing = getByThirdOrgIdAndMonth(thirdOrg.getOrgId(), currentMonth);
                    
                    // 如果已存在且状态是 EXECUTED 或 PAID，跳过（不需要再登记）
                    if (existing != null && 
                        (SalaryIssuanceStatus.EXECUTED.getCode().equals(existing.getStatus()) ||
                         SalaryIssuanceStatus.PAID.getCode().equals(existing.getStatus()))) {
                        continue;
                    }
                    
                    // 检查该机构当前月份是否有待登记的需求
                    PendingRegistrationResponse response = buildPendingRegistrationResponse(thirdOrg, existing, currentMonth);
                    if (response != null) {
                        response.setIssuanceMonth(currentMonth);
                        result.add(response);
                    }
                }
            }
        }

        return result;
    }

    /**
     * 构建待登记响应对象
     */
    private PendingRegistrationResponse buildPendingRegistrationResponse(Organization thirdOrg, SalaryIssuance existing, LocalDate monthDate) {
        PendingRegistrationResponse response = new PendingRegistrationResponse();
        response.setThirdOrgId(thirdOrg.getOrgId());
        response.setThirdOrgName(thirdOrg.getOrgName());
        
        // 如果已存在记录且状态是待复核，使用已存在记录的数据
        if (existing != null && SalaryIssuanceStatus.PENDING_REVIEW.getCode().equals(existing.getStatus())) {
            response.setTotalEmployees(existing.getTotalEmployees());
            response.setTotalBasicSalary(existing.getTotalBasicSalary());
            response.setStatus(existing.getStatus());
            response.setSalarySlipNumber(existing.getSalarySlipNumber());
        } else {
            // 查询该机构下正常状态的员工
            // 根据三级机构的创建时间来判断员工筛选规则：
            // 如果机构是在本月或之前创建的，该机构下的员工从机构创建月份开始出现在薪酬发放中
            // 如果机构是在本月创建的，该机构下的员工从本月开始出现在薪酬发放中（不受员工登记时间限制）
            final LocalDate orgCreateMonth;
            if (thirdOrg.getCreateTime() != null) {
                LocalDate orgCreateDate = thirdOrg.getCreateTime().toLocalDate();
                orgCreateMonth = orgCreateDate.withDayOfMonth(1);
            } else {
                orgCreateMonth = null;
            }
            
            // 如果机构创建月份早于或等于查询月份，使用机构创建月份作为筛选基准
            // 否则不显示该机构（机构创建月份晚于查询月份）
            final LocalDate nextMonth = monthDate.plusMonths(1);
            final LocalDate finalMonthDate = monthDate;
            
            List<EmployeeArchive> employees = employeeArchiveService.getByThirdOrgId(thirdOrg.getOrgId());
            employees = employees.stream()
                    .filter(e -> EmployeeArchiveStatus.NORMAL.getCode().equals(e.getStatus()))
                    .filter(e -> e.getSalaryStandardId() != null)
                    .filter(e -> {
                        // 根据机构创建时间判断员工筛选规则：
                        // 1. 如果机构是在本月创建的，该机构下的员工从本月开始出现在薪酬发放中（不受员工登记时间限制）
                        // 2. 如果机构是在之前月份创建的（早期建立的机构），使用原来的逻辑：员工登记时间必须在查询月份之前
                        if (orgCreateMonth != null && !orgCreateMonth.isAfter(finalMonthDate)) {
                            if (e.getRegistrationTime() != null) {
                                LocalDate empRegDate = e.getRegistrationTime().toLocalDate();
                                LocalDate empRegMonth = empRegDate.withDayOfMonth(1);
                                
                                // 如果机构创建月份等于查询月份（机构是在本月创建的）
                                if (orgCreateMonth.equals(finalMonthDate)) {
                                    // 员工从机构创建月份开始出现，只要登记月份不晚于查询月份的下个月即可
                                    return !empRegMonth.isAfter(nextMonth);
                                } else {
                                    // 机构是在之前月份创建的（早期建立的机构），使用原来的逻辑
                                    // 员工登记时间必须在查询月份之前（本月及以后添加的员工不应该出现在本月的薪酬发放中）
                                    return empRegMonth.isBefore(finalMonthDate);
                                }
                            }
                            return false;
                        } else {
                            // 机构是在查询月份之后创建的，不显示（已在前面过滤）
                            return false;
                        }
                    })
                    .filter(e -> {
                        // 检查薪酬标准是否存在且已通过
                        if (e.getSalaryStandardId() != null) {
                            SalaryStandard standard = salaryStandardService.getById(e.getSalaryStandardId());
                            return standard != null && SalaryStandardStatus.APPROVED.getCode().equals(standard.getStatus());
                        }
                        return false;
                    })
                    .collect(Collectors.toList());

            // 如果没有符合条件的员工，不显示该机构
            if (employees.isEmpty()) {
                return null;
            }

            // 计算基本工资总额
            BigDecimal totalBasicSalary = BigDecimal.ZERO;
            for (EmployeeArchive employee : employees) {
                if (employee.getSalaryStandardId() != null) {
                    SalaryStandard standard = salaryStandardService.getById(employee.getSalaryStandardId());
                    // 只使用已通过的薪酬标准
                    if (standard != null && SalaryStandardStatus.APPROVED.getCode().equals(standard.getStatus())) {
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

            response.setTotalEmployees(employees.size());
            response.setTotalBasicSalary(totalBasicSalary);
            response.setStatus(existing != null ? existing.getStatus() : SalaryIssuanceStatus.PENDING_REGISTRATION.getCode());
            if (existing != null) {
                response.setSalarySlipNumber(existing.getSalarySlipNumber());
            }
        }

        // 构建机构全路径
        String orgFullPath = buildOrgFullPath(thirdOrg);
        response.setOrgFullPath(orgFullPath);

        return response;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SalaryIssuance createSalaryIssuance(CreateSalaryIssuanceRequest request, Long registrarId) {
        // 解析发放月份
        YearMonth yearMonth = YearMonth.parse(request.getIssuanceMonth());
        LocalDate monthDate = yearMonth.atDay(1);

        // 检查是否已存在
        SalaryIssuance existing = getByThirdOrgIdAndMonth(request.getThirdOrgId(), monthDate);
        
        // 检查是否存在不可编辑状态的记录
        if (existing != null) {
            String status = existing.getStatus();
            // 只允许更新待登记或待复核状态的记录
            if (!SalaryIssuanceStatus.PENDING_REGISTRATION.getCode().equals(status) &&
                !SalaryIssuanceStatus.PENDING_REVIEW.getCode().equals(status)) {
                // 检查是否还有其他可编辑的记录
                LambdaQueryWrapper<SalaryIssuance> checkWrapper = new LambdaQueryWrapper<>();
                checkWrapper.eq(SalaryIssuance::getThirdOrgId, request.getThirdOrgId())
                           .eq(SalaryIssuance::getIssuanceMonth, monthDate)
                           .in(SalaryIssuance::getStatus, 
                               SalaryIssuanceStatus.PENDING_REGISTRATION.getCode(),
                               SalaryIssuanceStatus.PENDING_REVIEW.getCode());
                long editableCount = count(checkWrapper);
                
                if (editableCount > 0) {
                    // 存在可编辑的记录，但getByThirdOrgIdAndMonth返回了不可编辑的记录
                    // 这通常意味着存在重复数据，应该使用可编辑的记录
                    existing = list(checkWrapper).get(0);
                } else {
                    // 确实存在不可编辑的记录，抛出异常
                    throw new RuntimeException(String.format(
                        "该机构该月份已存在薪酬发放单（状态：%s，单号：%s），无法修改。如需修改，请先删除或修改现有记录。",
                        status, existing.getSalarySlipNumber() != null ? existing.getSalarySlipNumber() : "无"
                    ));
                }
            }
        }

        // 生成薪酬单号（如果不存在记录）
        String salarySlipNumber;
        if (existing != null && existing.getSalarySlipNumber() != null) {
            // 使用已存在的薪酬单号
            salarySlipNumber = existing.getSalarySlipNumber();
        } else {
            // 生成新的薪酬单号
            salarySlipNumber = generateSalarySlipNumber();
        }

        SalaryIssuance issuance;
        if (existing != null) {
            issuance = existing;
            issuance.setSalarySlipNumber(salarySlipNumber);
            // 更新状态为待复核
            issuance.setStatus(SalaryIssuanceStatus.PENDING_REVIEW.getCode());
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
                    detailRequest.getDeductionAmount() != null ? detailRequest.getDeductionAmount() : BigDecimal.ZERO,
                    issuance.getIssuanceMonth()
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
        // 如果没有指定日期范围，默认查询当前月份
        if (startDate == null && endDate == null) {
            LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
            LocalDate nextMonth = currentMonth.plusMonths(1);
            wrapper.ge(SalaryIssuance::getIssuanceMonth, currentMonth)
                   .lt(SalaryIssuance::getIssuanceMonth, nextMonth);
        } else {
            // 如果指定了日期范围，按指定范围查询
            // 将日期转换为月份的第一天进行比较，确保能正确匹配
        if (startDate != null) {
                LocalDate startMonth = startDate.withDayOfMonth(1);
                wrapper.ge(SalaryIssuance::getIssuanceMonth, startMonth);
        }
        if (endDate != null) {
                // 将结束日期转换为月份的第一天，然后查询该月份及之前的所有记录
                LocalDate endMonth = endDate.withDayOfMonth(1);
                LocalDate nextMonth = endMonth.plusMonths(1);
                wrapper.lt(SalaryIssuance::getIssuanceMonth, nextMonth);
            }
        }

        // 状态查询
        // 如果没有指定状态，默认查询已复核（EXECUTED）和待复核（PENDING_REVIEW）的记录
        if (status != null && !status.trim().isEmpty()) {
            wrapper.eq(SalaryIssuance::getStatus, status);
        } else {
            // 默认查询已复核和待复核的记录
            wrapper.in(SalaryIssuance::getStatus, 
                    SalaryIssuanceStatus.EXECUTED.getCode(),
                    SalaryIssuanceStatus.PENDING_REVIEW.getCode());
        }

        // 三级机构ID查询
        if (thirdOrgId != null) {
            wrapper.eq(SalaryIssuance::getThirdOrgId, thirdOrgId);
        }

        wrapper.orderByDesc(SalaryIssuance::getRegistrationTime);

        return page(pageParam, wrapper);
    }

    @Override
    public IPage<SalaryIssuance> getPendingReviewPage(String issuanceMonth, int page, int size) {
        Page<SalaryIssuance> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<SalaryIssuance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SalaryIssuance::getStatus, SalaryIssuanceStatus.PENDING_REVIEW.getCode());
        
        // 如果指定了月份，添加月份筛选条件
        if (issuanceMonth != null && !issuanceMonth.trim().isEmpty()) {
            try {
                java.time.YearMonth yearMonth = java.time.YearMonth.parse(issuanceMonth);
                LocalDate monthDate = yearMonth.atDay(1);
                LocalDate nextMonthDate = monthDate.plusMonths(1);
                wrapper.ge(SalaryIssuance::getIssuanceMonth, monthDate)
                       .lt(SalaryIssuance::getIssuanceMonth, nextMonthDate);
            } catch (Exception e) {
                // 如果月份格式错误，忽略该条件
            }
        }
        
        wrapper.orderByDesc(SalaryIssuance::getRegistrationTime);
        return page(pageParam, wrapper);
    }

    /**
     * 创建薪酬发放明细
     */
    private SalaryIssuanceDetail createSalaryIssuanceDetail(Long issuanceId, EmployeeArchive employee,
                                                            BigDecimal awardAmount, BigDecimal deductionAmount, LocalDate issuanceMonth) {
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
        // 只包含在发放月份之前创建的薪酬项目（本月及其以后创建的薪酬项目不应该出现在本月的薪酬发放登记里面）
        LocalDate nextMonth = issuanceMonth != null ? issuanceMonth.plusMonths(1) : null;
        LocalDateTime nextMonthStart = nextMonth != null ? nextMonth.atStartOfDay() : null;
        
        if (employee.getSalaryStandardId() != null) {
            SalaryStandard standard = salaryStandardService.getById(employee.getSalaryStandardId());
            // 只使用已通过的薪酬标准
            if (standard != null && SalaryStandardStatus.APPROVED.getCode().equals(standard.getStatus())) {
                List<SalaryStandardItem> standardItems = salaryStandardItemService.getByStandardId(standard.getStandardId());
                List<SalaryItem> salaryItems = salaryItemService.list();

                Map<Long, SalaryItem> salaryItemMap = salaryItems.stream()
                        .collect(Collectors.toMap(SalaryItem::getItemId, item -> item));

                // 用于存储动态项目（无法映射到固定字段的新项目）
                Map<String, BigDecimal> dynamicItems = new HashMap<>();
                
                for (SalaryStandardItem standardItem : standardItems) {
                    SalaryItem salaryItem = salaryItemMap.get(standardItem.getItemId());
                    if (salaryItem != null) {
                        // 如果指定了发放月份，只包含在该月份之前创建的薪酬项目
                        if (nextMonthStart != null && salaryItem.getCreateTime() != null) {
                            if (!salaryItem.getCreateTime().isBefore(nextMonthStart)) {
                                // 薪酬项目是在发放月份之后创建的，跳过
                                continue;
                            }
                        }
                        BigDecimal amount = standardItem.getAmount() != null ? standardItem.getAmount() : BigDecimal.ZERO;
                        String itemCode = salaryItem.getItemCode();
                        String itemType = salaryItem.getItemType();

                        // 映射到固定字段
                        boolean mapped = false;
                        switch (itemCode) {
                            case "S001": // 基本工资
                                detail.setBasicSalary(amount);
                                mapped = true;
                                break;
                            case "S002": // 绩效奖金
                                detail.setPerformanceBonus(amount);
                                mapped = true;
                                break;
                            case "S003": // 交通补贴
                                detail.setTransportationAllowance(amount);
                                mapped = true;
                                break;
                            case "S004": // 餐费补贴
                                detail.setMealAllowance(amount);
                                mapped = true;
                                break;
                            case "S006": // 养老保险
                                detail.setPensionInsurance(amount);
                                mapped = true;
                                break;
                            case "S007": // 医疗保险
                                detail.setMedicalInsurance(amount);
                                mapped = true;
                                break;
                            case "S008": // 失业保险
                                detail.setUnemploymentInsurance(amount);
                                mapped = true;
                                break;
                            case "S009": // 住房公积金
                                detail.setHousingFund(amount);
                                mapped = true;
                                break;
                        }
                        
                        // 如果无法映射到固定字段，放入动态项目Map中
                        if (!mapped && amount.compareTo(BigDecimal.ZERO) > 0) {
                            dynamicItems.put(itemCode, amount);
                        }
                    }
                }
                
                // 将动态项目存储到detail中（通过反射或临时存储）
                // 注意：由于SalaryIssuanceDetail实体类没有dynamicItems字段，
                // 我们需要在转换为Response时处理
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

    @Override
    public List<SalaryIssuanceDetailResponse> getRegistrationDetails(Long thirdOrgId, String issuanceMonth) {
        // 解析发放月份
        LocalDate monthDate;
        if (issuanceMonth != null && !issuanceMonth.trim().isEmpty()) {
            YearMonth yearMonth = YearMonth.parse(issuanceMonth);
            monthDate = yearMonth.atDay(1);
        } else {
            monthDate = LocalDate.now().withDayOfMonth(1);
        }

        // 检查是否已存在薪酬发放单（待复核状态）
        SalaryIssuance existing = getByThirdOrgIdAndMonth(thirdOrgId, monthDate);
        if (existing != null && SalaryIssuanceStatus.PENDING_REVIEW.getCode().equals(existing.getStatus())) {
            // 如果已存在待复核状态的记录，返回已保存的明细
            List<SalaryIssuanceDetail> details = salaryIssuanceDetailService.getByIssuanceId(existing.getIssuanceId());
            return details.stream().map(detail -> {
                SalaryIssuanceDetailResponse response = new SalaryIssuanceDetailResponse();
                response.setDetailId(detail.getDetailId());
                response.setEmployeeId(detail.getEmployeeId());
                response.setEmployeeNumber(detail.getEmployeeNumber());
                response.setEmployeeName(detail.getEmployeeName());
                response.setPositionName(detail.getPositionName());
                response.setBasicSalary(detail.getBasicSalary());
                response.setPerformanceBonus(detail.getPerformanceBonus());
                response.setTransportationAllowance(detail.getTransportationAllowance());
                response.setMealAllowance(detail.getMealAllowance());
                response.setPensionInsurance(detail.getPensionInsurance());
                response.setMedicalInsurance(detail.getMedicalInsurance());
                response.setUnemploymentInsurance(detail.getUnemploymentInsurance());
                response.setHousingFund(detail.getHousingFund());
                response.setAwardAmount(detail.getAwardAmount());
                response.setDeductionAmount(detail.getDeductionAmount());
                response.setTotalIncome(detail.getTotalIncome());
                response.setTotalDeduction(detail.getTotalDeduction());
                response.setNetPay(detail.getNetPay());
                return response;
            }).collect(Collectors.toList());
        }

        // 如果不存在或状态不是待复核，根据薪酬标准计算明细
        // 只包含在登记月份之前添加的员工（本月及其以后添加的员工不应该出现在本月的薪酬发放登记里面）
        // 同时只包含在发放月份之前创建的薪酬项目
        LocalDate nextMonth = monthDate.plusMonths(1);
        LocalDateTime nextMonthStart = nextMonth.atStartOfDay();
        
        List<EmployeeArchive> employees = employeeArchiveService.getByThirdOrgId(thirdOrgId);
        employees = employees.stream()
                .filter(e -> EmployeeArchiveStatus.NORMAL.getCode().equals(e.getStatus()))
                .filter(e -> e.getSalaryStandardId() != null)
                .filter(e -> e.getRegistrationTime() != null && e.getRegistrationTime().isBefore(nextMonthStart))
                .filter(e -> {
                    // 检查薪酬标准是否存在且已通过
                    if (e.getSalaryStandardId() != null) {
                        SalaryStandard standard = salaryStandardService.getById(e.getSalaryStandardId());
                        return standard != null && SalaryStandardStatus.APPROVED.getCode().equals(standard.getStatus());
                    }
                    return false;
                })
                .collect(Collectors.toList());

        List<com.example.common.dto.SalaryIssuanceDetailResponse> result = new ArrayList<>();

        // 获取所有薪酬项目（用于动态处理新项目）
        List<SalaryItem> allSalaryItems = salaryItemService.list();
        Map<Long, SalaryItem> salaryItemMap = allSalaryItems.stream()
                .collect(Collectors.toMap(SalaryItem::getItemId, item -> item));
        
        for (EmployeeArchive employee : employees) {
            // 创建临时明细对象（不保存到数据库）
            SalaryIssuanceDetail tempDetail = createSalaryIssuanceDetail(null, employee, BigDecimal.ZERO, BigDecimal.ZERO, monthDate);
            
            // 转换为响应对象
            SalaryIssuanceDetailResponse response = new SalaryIssuanceDetailResponse();
            response.setEmployeeId(tempDetail.getEmployeeId());
            response.setEmployeeNumber(tempDetail.getEmployeeNumber());
            response.setEmployeeName(tempDetail.getEmployeeName());
            response.setPositionName(tempDetail.getPositionName());
            response.setBasicSalary(tempDetail.getBasicSalary());
            response.setPerformanceBonus(tempDetail.getPerformanceBonus());
            response.setTransportationAllowance(tempDetail.getTransportationAllowance());
            response.setMealAllowance(tempDetail.getMealAllowance());
            response.setPensionInsurance(tempDetail.getPensionInsurance());
            response.setMedicalInsurance(tempDetail.getMedicalInsurance());
            response.setUnemploymentInsurance(tempDetail.getUnemploymentInsurance());
            response.setHousingFund(tempDetail.getHousingFund());
            response.setAwardAmount(BigDecimal.ZERO);
            response.setDeductionAmount(BigDecimal.ZERO);
            
            // 获取该员工的薪酬标准，提取所有项目（包括新项目）
            // 只包含在发放月份之前创建的薪酬项目
            Map<String, BigDecimal> dynamicItems = new HashMap<>();
            BigDecimal additionalIncome = BigDecimal.ZERO;
            BigDecimal additionalDeduction = BigDecimal.ZERO;
            
            if (employee.getSalaryStandardId() != null) {
                SalaryStandard standard = salaryStandardService.getById(employee.getSalaryStandardId());
                if (standard != null) {
                    List<SalaryStandardItem> standardItems = salaryStandardItemService.getByStandardId(standard.getStandardId());
                    
                    for (SalaryStandardItem standardItem : standardItems) {
                        SalaryItem salaryItem = salaryItemMap.get(standardItem.getItemId());
                        if (salaryItem != null) {
                            // 只包含在发放月份之前创建的薪酬项目
                            if (salaryItem.getCreateTime() != null && nextMonthStart != null) {
                                if (!salaryItem.getCreateTime().isBefore(nextMonthStart)) {
                                    // 薪酬项目是在发放月份之后创建的，跳过
                                    continue;
                                }
                            }
                            
                            BigDecimal amount = standardItem.getAmount() != null ? standardItem.getAmount() : BigDecimal.ZERO;
                            String itemCode = salaryItem.getItemCode();
                            String itemType = salaryItem.getItemType();
                            
                            // 检查是否映射到固定字段
                            boolean isFixedField = "S001".equals(itemCode) || "S002".equals(itemCode) ||
                                    "S003".equals(itemCode) || "S004".equals(itemCode) ||
                                    "S006".equals(itemCode) || "S007".equals(itemCode) ||
                                    "S008".equals(itemCode) || "S009".equals(itemCode);
                            
                            // 如果是新项目（无法映射到固定字段），放入dynamicItems
                            if (!isFixedField && amount.compareTo(BigDecimal.ZERO) > 0) {
                                dynamicItems.put(itemCode, amount);
                                // 累加到总收入或总扣除中
                                if ("INCOME".equals(itemType)) {
                                    additionalIncome = additionalIncome.add(amount);
                                } else if ("DEDUCTION".equals(itemType)) {
                                    additionalDeduction = additionalDeduction.add(amount);
                                }
                            }
                        }
                    }
                }
            }
            
            response.setDynamicItems(dynamicItems);
            
            // 重新计算合计（包括动态项目）
            BigDecimal totalIncome = (tempDetail.getTotalIncome() != null ? tempDetail.getTotalIncome() : BigDecimal.ZERO)
                    .add(additionalIncome);
            BigDecimal totalDeduction = (tempDetail.getTotalDeduction() != null ? tempDetail.getTotalDeduction() : BigDecimal.ZERO)
                    .add(additionalDeduction);
            BigDecimal netPay = totalIncome.subtract(totalDeduction);
            
            response.setTotalIncome(totalIncome.setScale(2, RoundingMode.HALF_UP));
            response.setTotalDeduction(totalDeduction.setScale(2, RoundingMode.HALF_UP));
            response.setNetPay(netPay.setScale(2, RoundingMode.HALF_UP));
            
            result.add(response);
        }

        return result;
    }
}

