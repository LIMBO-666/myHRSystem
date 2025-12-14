package com.example.storage.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.common.dto.CreateSalaryStandardRequest;
import com.example.common.dto.SalaryStandardItemRequest;
import com.example.common.dto.UpdateSalaryStandardRequest;
import com.example.common.entity.EmployeeArchive;
import com.example.common.entity.SalaryItem;
import com.example.common.entity.SalaryStandard;
import com.example.common.entity.SalaryStandardItem;
import com.example.common.enums.EmployeeArchiveStatus;
import com.example.common.enums.SalaryStandardStatus;
import com.example.storage.mapper.SalaryStandardMapper;
import com.example.storage.service.EmployeeArchiveService;
import com.example.storage.service.SalaryItemService;
import com.example.storage.service.SalaryStandardItemService;
import com.example.storage.service.SalaryStandardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 薪酬标准表 Service 实现类
 */
@Service
public class SalaryStandardServiceImpl extends ServiceImpl<SalaryStandardMapper, SalaryStandard> implements SalaryStandardService {

    @Autowired
    private SalaryStandardItemService salaryStandardItemService;
    @Autowired
    private SalaryItemService salaryItemService;
    @Autowired
    @Lazy
    private EmployeeArchiveService employeeArchiveService;

    @Override
    public SalaryStandard getByPositionIdAndJobTitle(Long positionId, String jobTitle) {
        LambdaQueryWrapper<SalaryStandard> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SalaryStandard::getPositionId, positionId)
               .eq(SalaryStandard::getJobTitle, jobTitle);
        return getOne(wrapper);
    }

    @Override
    public List<SalaryStandard> getByStatus(String status) {
        LambdaQueryWrapper<SalaryStandard> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SalaryStandard::getStatus, status);
        return list(wrapper);
    }

    @Override
    public List<SalaryStandard> getPendingReview() {
        return getByStatus(SalaryStandardStatus.PENDING_REVIEW.getCode());
    }

    @Override
    public List<SalaryStandard> getApproved() {
        return getByStatus(SalaryStandardStatus.APPROVED.getCode());
    }

    @Override
    public SalaryStandard getByStandardCode(String standardCode) {
        LambdaQueryWrapper<SalaryStandard> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SalaryStandard::getStandardCode, standardCode);
        return getOne(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SalaryStandard createSalaryStandard(CreateSalaryStandardRequest request, Long registrarId) {
        // 检查是否存在已通过的相同职位和职称的薪酬标准
        SalaryStandard existingStandard = getApprovedByPositionIdAndJobTitle(
                request.getPositionId(), request.getJobTitle());

        if (existingStandard != null) {
            // 如果存在已通过的相同职位和职称的薪酬标准，则更新它（保持标准编号不变）
            // 更新基本信息
            existingStandard.setStandardName(request.getStandardName());
            existingStandard.setFormulatorId(request.getFormulatorId());
            existingStandard.setRegistrarId(registrarId != null ? registrarId : request.getRegistrarId());
            existingStandard.setRegistrationTime(LocalDateTime.now());
            // 更新后状态变为待复核
            existingStandard.setStatus(SalaryStandardStatus.PENDING_REVIEW.getCode());
            existingStandard.setReviewerId(null);
            existingStandard.setReviewTime(null);
            existingStandard.setReviewComments(null);

            updateById(existingStandard);

            // 删除旧的明细
            salaryStandardItemService.deleteByStandardId(existingStandard.getStandardId());

            // 获取基本工资金额（用于计算三险一金）
            BigDecimal basicSalary = getBasicSalary(request.getItems());

            // 保存新的明细
            saveStandardItems(existingStandard.getStandardId(), request.getItems(), basicSalary);

            return existingStandard;
        }

        // 如果不存在已通过的相同职位和职称的薪酬标准，则创建新的
        // 生成薪酬标准编号
        String standardCode = generateStandardCode();

        // 创建薪酬标准
        SalaryStandard standard = new SalaryStandard();
        standard.setStandardCode(standardCode);
        standard.setStandardName(request.getStandardName());
        standard.setPositionId(request.getPositionId());
        standard.setJobTitle(request.getJobTitle());
        standard.setFormulatorId(request.getFormulatorId());
        standard.setRegistrarId(registrarId != null ? registrarId : request.getRegistrarId());
        standard.setRegistrationTime(LocalDateTime.now());
        standard.setStatus(SalaryStandardStatus.PENDING_REVIEW.getCode());

        // 保存薪酬标准
        save(standard);

        // 获取基本工资金额（用于计算三险一金）
        BigDecimal basicSalary = getBasicSalary(request.getItems());

        // 保存薪酬标准明细
        saveStandardItems(standard.getStandardId(), request.getItems(), basicSalary);

        return standard;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SalaryStandard updateSalaryStandard(Long standardId, UpdateSalaryStandardRequest request) {
        SalaryStandard standard = getById(standardId);
        if (standard == null) {
            throw new RuntimeException("薪酬标准不存在");
        }

        // 只有待复核或已驳回状态才能更新
        if (!SalaryStandardStatus.PENDING_REVIEW.getCode().equals(standard.getStatus())
                && !SalaryStandardStatus.REJECTED.getCode().equals(standard.getStatus())) {
            throw new RuntimeException("只有待复核或已驳回状态的薪酬标准才能更新");
        }

        // 更新基本信息
        if (request.getStandardName() != null) {
            standard.setStandardName(request.getStandardName());
        }
        // 更新后状态变为待复核
        standard.setStatus(SalaryStandardStatus.PENDING_REVIEW.getCode());
        standard.setReviewerId(null);
        standard.setReviewTime(null);
        standard.setReviewComments(null);

        updateById(standard);

        // 如果提供了项目明细，则更新明细
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            // 删除旧的明细
            salaryStandardItemService.deleteByStandardId(standardId);

            // 获取基本工资金额（用于计算三险一金）
            BigDecimal basicSalary = getBasicSalary(request.getItems());

            // 保存新的明细
            saveStandardItems(standardId, request.getItems(), basicSalary);
        }

        return standard;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean approveReview(Long standardId, Long reviewerId, String reviewComments) {
        SalaryStandard standard = getById(standardId);
        if (standard == null) {
            throw new RuntimeException("薪酬标准不存在");
        }
        if (!SalaryStandardStatus.PENDING_REVIEW.getCode().equals(standard.getStatus())) {
            throw new RuntimeException("薪酬标准状态不是待复核，无法进行复核操作");
        }

        LambdaUpdateWrapper<SalaryStandard> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(SalaryStandard::getStandardId, standardId)
               .set(SalaryStandard::getStatus, SalaryStandardStatus.APPROVED.getCode())
               .set(SalaryStandard::getReviewerId, reviewerId)
               .set(SalaryStandard::getReviewTime, LocalDateTime.now())
               .set(SalaryStandard::getReviewComments, reviewComments);

        boolean result = update(wrapper);
        
        // 如果审核通过，自动关联到符合条件的员工档案
        if (result) {
            SalaryStandard approvedStandard = getById(standardId);
            if (approvedStandard != null && approvedStandard.getPositionId() != null && approvedStandard.getJobTitle() != null) {
                // 查找该职位和职称下，状态为正常且未关联薪酬标准的员工
                List<EmployeeArchive> employees = employeeArchiveService.getByPositionId(approvedStandard.getPositionId());
                employees = employees.stream()
                        .filter(e -> EmployeeArchiveStatus.NORMAL.getCode().equals(e.getStatus()))
                        .filter(e -> approvedStandard.getJobTitle().equals(e.getJobTitle()))
                        .filter(e -> e.getSalaryStandardId() == null)
                        .collect(java.util.stream.Collectors.toList());
                
                // 自动关联薪酬标准
                for (EmployeeArchive employee : employees) {
                    employee.setSalaryStandardId(approvedStandard.getStandardId());
                    employeeArchiveService.updateById(employee);
                }
            }
        }
        
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean rejectReview(Long standardId, Long reviewerId, String reviewComments) {
        SalaryStandard standard = getById(standardId);
        if (standard == null) {
            throw new RuntimeException("薪酬标准不存在");
        }
        if (!SalaryStandardStatus.PENDING_REVIEW.getCode().equals(standard.getStatus())) {
            throw new RuntimeException("薪酬标准状态不是待复核，无法进行复核操作");
        }

        LambdaUpdateWrapper<SalaryStandard> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(SalaryStandard::getStandardId, standardId)
               .set(SalaryStandard::getStatus, SalaryStandardStatus.REJECTED.getCode())
               .set(SalaryStandard::getReviewerId, reviewerId)
               .set(SalaryStandard::getReviewTime, LocalDateTime.now())
               .set(SalaryStandard::getReviewComments, reviewComments);

        return update(wrapper);
    }

    @Override
    public SalaryStandard getApprovedByPositionIdAndJobTitle(Long positionId, String jobTitle) {
        LambdaQueryWrapper<SalaryStandard> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SalaryStandard::getPositionId, positionId)
               .eq(SalaryStandard::getJobTitle, jobTitle)
               .eq(SalaryStandard::getStatus, SalaryStandardStatus.APPROVED.getCode())
               .orderByDesc(SalaryStandard::getReviewTime) // 按复核时间降序，获取最新的
               .last("LIMIT 1"); // 限制只返回一条
        List<SalaryStandard> list = list(wrapper);
        return list.isEmpty() ? null : list.get(0);
    }

    @Override
    public IPage<SalaryStandard> querySalaryStandards(String standardCode, String keyword, LocalDate startDate,
                                                      LocalDate endDate, String status, Long positionId, String jobTitle,
                                                      int page, int size) {
        Page<SalaryStandard> pageParam = new Page<>(page, size);
        // 设置不优化count查询，确保count查询准确
        pageParam.setOptimizeCountSql(false);
        
        LambdaQueryWrapper<SalaryStandard> wrapper = new LambdaQueryWrapper<>();

        // 薪酬标准编号模糊查询
        if (standardCode != null && !standardCode.trim().isEmpty()) {
            wrapper.like(SalaryStandard::getStandardCode, standardCode);
        }

        // 关键字查询（在标准名称、制定人、变更人、复核人字段中匹配）
        // 注意：这里需要关联user表，暂时先按标准名称匹配
        if (keyword != null && !keyword.trim().isEmpty()) {
            wrapper.and(w -> w.like(SalaryStandard::getStandardName, keyword));
        }

        // 登记时间范围查询
        if (startDate != null) {
            wrapper.ge(SalaryStandard::getRegistrationTime, startDate.atStartOfDay());
        }
        if (endDate != null) {
            wrapper.le(SalaryStandard::getRegistrationTime, endDate.atTime(23, 59, 59));
        }

        // 状态查询
        if (status != null && !status.trim().isEmpty()) {
            wrapper.eq(SalaryStandard::getStatus, status);
        }

        // 职位ID查询
        if (positionId != null) {
            wrapper.eq(SalaryStandard::getPositionId, positionId);
        }

        // 职称查询
        if (jobTitle != null && !jobTitle.trim().isEmpty()) {
            wrapper.eq(SalaryStandard::getJobTitle, jobTitle);
        }

        // 排序：按标准ID降序（最新的记录ID最大），确保排序稳定且所有记录都能正确显示
        wrapper.orderByDesc(SalaryStandard::getStandardId);

        IPage<SalaryStandard> result = page(pageParam, wrapper);
        
        // 如果count为0但实际有数据，重新计算count
        if (result.getTotal() == 0 && !result.getRecords().isEmpty()) {
            long actualCount = count(wrapper);
            result.setTotal(actualCount);
        }
        
        return result;
    }

    @Override
    public IPage<SalaryStandard> getPendingReviewPage(int page, int size) {
        Page<SalaryStandard> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<SalaryStandard> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SalaryStandard::getStatus, SalaryStandardStatus.PENDING_REVIEW.getCode())
               .orderByDesc(SalaryStandard::getRegistrationTime);
        return page(pageParam, wrapper);
    }

    /**
     * 生成薪酬标准编号
     * 格式：SAL + 年月（6位）+ 序号（3位）
     * 例如：SAL202307001
     */
    private String generateStandardCode() {
        LocalDate now = LocalDate.now();
        String yearMonth = String.format("%04d%02d", now.getYear(), now.getMonthValue());

        // 查询当月最大序号
        LambdaQueryWrapper<SalaryStandard> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(SalaryStandard::getStandardCode, "SAL" + yearMonth)
               .orderByDesc(SalaryStandard::getStandardCode)
               .last("LIMIT 1");

        SalaryStandard lastStandard = getOne(wrapper);
        int sequence = 1;

        if (lastStandard != null && lastStandard.getStandardCode() != null) {
            String lastCode = lastStandard.getStandardCode();
            if (lastCode.length() >= 12) {
                try {
                    String sequenceStr = lastCode.substring(9);
                    sequence = Integer.parseInt(sequenceStr) + 1;
                } catch (NumberFormatException e) {
                    sequence = 1;
                }
            }
        }

        return String.format("SAL%s%03d", yearMonth, sequence);
    }

    /**
     * 从项目明细中获取基本工资金额
     */
    private BigDecimal getBasicSalary(List<SalaryStandardItemRequest> items) {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }

        // 查找基本工资项目（itemCode为S001）
        for (SalaryStandardItemRequest item : items) {
            SalaryItem salaryItem = salaryItemService.getById(item.getItemId());
            if (salaryItem != null && "S001".equals(salaryItem.getItemCode())) {
                return item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO;
            }
        }

        return BigDecimal.ZERO;
    }

    /**
     * 保存薪酬标准明细
     */
    private void saveStandardItems(Long standardId, List<SalaryStandardItemRequest> items, BigDecimal basicSalary) {
        if (items == null || items.isEmpty()) {
            return;
        }

        // 获取所有薪酬项目信息
        List<Long> itemIds = items.stream()
                .map(SalaryStandardItemRequest::getItemId)
                .collect(Collectors.toList());
        List<SalaryItem> salaryItems = salaryItemService.listByIds(itemIds);

        for (SalaryStandardItemRequest itemRequest : items) {
            SalaryStandardItem standardItem = new SalaryStandardItem();
            standardItem.setStandardId(standardId);
            standardItem.setItemId(itemRequest.getItemId());

            // 查找对应的薪酬项目
            SalaryItem salaryItem = salaryItems.stream()
                    .filter(si -> si.getItemId().equals(itemRequest.getItemId()))
                    .findFirst()
                    .orElse(null);

            if (salaryItem == null) {
                continue;
            }

            // 判断是否需要自动计算（三险一金）
            boolean isCalculated = false;
            BigDecimal amount = itemRequest.getAmount() != null ? itemRequest.getAmount() : BigDecimal.ZERO;

            if (itemRequest.getIsCalculated() != null && itemRequest.getIsCalculated()) {
                // 标记为自动计算
                isCalculated = true;
                amount = calculateInsuranceAmount(salaryItem.getItemCode(), basicSalary);
            } else if (salaryItem.getCalculationRule() != null && !salaryItem.getCalculationRule().trim().isEmpty()) {
                // 如果有计算规则且未手动指定金额，则自动计算
                isCalculated = true;
                amount = calculateInsuranceAmount(salaryItem.getItemCode(), basicSalary);
            }

            standardItem.setAmount(amount.setScale(2, RoundingMode.HALF_UP));
            standardItem.setIsCalculated(isCalculated);

            salaryStandardItemService.save(standardItem);
        }
    }

    /**
     * 计算三险一金金额
     * 养老保险 = 基本工资 * 8%
     * 医疗保险 = 基本工资 * 2% + 3元
     * 失业保险 = 基本工资 * 0.5%
     * 住房公积金 = 基本工资 * 8%
     */
    private BigDecimal calculateInsuranceAmount(String itemCode, BigDecimal basicSalary) {
        if (basicSalary == null || basicSalary.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        switch (itemCode) {
            case "S006": // 养老保险
                return basicSalary.multiply(new BigDecimal("0.08")).setScale(2, RoundingMode.HALF_UP);
            case "S007": // 医疗保险
                return basicSalary.multiply(new BigDecimal("0.02")).add(new BigDecimal("3")).setScale(2, RoundingMode.HALF_UP);
            case "S008": // 失业保险
                return basicSalary.multiply(new BigDecimal("0.005")).setScale(2, RoundingMode.HALF_UP);
            case "S009": // 住房公积金
                return basicSalary.multiply(new BigDecimal("0.08")).setScale(2, RoundingMode.HALF_UP);
            default:
                return BigDecimal.ZERO;
        }
    }
}

