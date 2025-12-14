package com.example.storage.service.Impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.common.entity.EmployeeArchive;
import com.example.common.entity.Organization;
import com.example.common.entity.SalaryStandard;
import com.example.common.enums.EmployeeArchiveStatus;
import com.example.storage.mapper.EmployeeArchiveMapper;
import com.example.storage.service.EmployeeArchiveService;
import com.example.storage.service.OrganizationService;
import com.example.storage.service.SalaryStandardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 员工档案表 Service 实现类
 */
@Service
public class EmployeeArchiveServiceImpl extends ServiceImpl<EmployeeArchiveMapper, EmployeeArchive> implements EmployeeArchiveService {

    @Autowired
    private OrganizationService organizationService;
    
    @Autowired
    @Lazy
    private SalaryStandardService salaryStandardService;

    @Override
    public List<EmployeeArchive> getByThirdOrgId(Long thirdOrgId) {
        LambdaQueryWrapper<EmployeeArchive> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(EmployeeArchive::getThirdOrgId, thirdOrgId);
        return list(wrapper);
    }

    @Override
    public List<EmployeeArchive> getByStatus(String status) {
        LambdaQueryWrapper<EmployeeArchive> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(EmployeeArchive::getStatus, status);
        return list(wrapper);
    }

    @Override
    public List<EmployeeArchive> getByPositionId(Long positionId) {
        LambdaQueryWrapper<EmployeeArchive> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(EmployeeArchive::getPositionId, positionId);
        return list(wrapper);
    }

    @Override
    public List<EmployeeArchive> getPendingReview() {
        return getByStatus("PENDING_REVIEW");
    }

    @Override
    public List<EmployeeArchive> getNormal() {
        return getByStatus("NORMAL");
    }

    @Override
    public List<EmployeeArchive> getDeleted() {
        return getByStatus("DELETED");
    }

    @Override
    public EmployeeArchive getByArchiveNumber(String archiveNumber) {
        LambdaQueryWrapper<EmployeeArchive> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(EmployeeArchive::getArchiveNumber, archiveNumber);
        return getOne(wrapper);
    }

    @Override
    public List<EmployeeArchive> getByRegistrationTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        LambdaQueryWrapper<EmployeeArchive> wrapper = new LambdaQueryWrapper<>();
        wrapper.ge(EmployeeArchive::getRegistrationTime, startTime)
               .le(EmployeeArchive::getRegistrationTime, endTime);
        return list(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean softDelete(Long archiveId, String deleteReason) {
        EmployeeArchive archive = getById(archiveId);
        if (archive == null) {
            throw new RuntimeException("档案不存在");
        }

        // 状态为"待复核"的员工档案不能删除
        if (EmployeeArchiveStatus.PENDING_REVIEW.getCode().equals(archive.getStatus())) {
            throw new RuntimeException("状态为待复核的员工档案不能删除");
        }

        // 如果已经是已删除状态，直接返回成功
        if (EmployeeArchiveStatus.DELETED.getCode().equals(archive.getStatus())) {
            return true;
        }

        LambdaUpdateWrapper<EmployeeArchive> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(EmployeeArchive::getArchiveId, archiveId)
               .set(EmployeeArchive::getStatus, EmployeeArchiveStatus.DELETED.getCode())
               .set(EmployeeArchive::getDeleteTime, LocalDateTime.now())
               .set(EmployeeArchive::getDeleteReason, deleteReason);
        return update(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean restore(Long archiveId) {
        EmployeeArchive archive = getById(archiveId);
        if (archive == null) {
            throw new RuntimeException("档案不存在");
        }

        // 只有已删除状态的档案才能恢复
        if (!EmployeeArchiveStatus.DELETED.getCode().equals(archive.getStatus())) {
            throw new RuntimeException("只有已删除状态的档案才能恢复");
        }

        LambdaUpdateWrapper<EmployeeArchive> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(EmployeeArchive::getArchiveId, archiveId)
               .set(EmployeeArchive::getStatus, EmployeeArchiveStatus.NORMAL.getCode())
               .set(EmployeeArchive::getDeleteTime, null)
               .set(EmployeeArchive::getDeleteReason, null);
        return update(wrapper);
    }

    @Override
    public IPage<EmployeeArchive> getDeletedPage(int page, int size) {
        Page<EmployeeArchive> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<EmployeeArchive> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(EmployeeArchive::getStatus, EmployeeArchiveStatus.DELETED.getCode())
               .orderByDesc(EmployeeArchive::getDeleteTime);
        return page(pageParam, wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public EmployeeArchive createEmployeeArchive(EmployeeArchive archive, Long registrarId) {
        // 设置登记人和登记时间
        archive.setRegistrarId(registrarId);
        archive.setRegistrationTime(LocalDateTime.now());

        // 设置状态为待复核
        archive.setStatus(EmployeeArchiveStatus.PENDING_REVIEW.getCode());

        // 生成档案编号
        String archiveNumber = generateArchiveNumber(
                archive.getFirstOrgId(),
                archive.getSecondOrgId(),
                archive.getThirdOrgId()
        );
        archive.setArchiveNumber(archiveNumber);

        // 如果提供了身份证号码和出生日期，自动计算年龄
        if (archive.getBirthday() != null && archive.getAge() == null) {
            LocalDate today = LocalDate.now();
            LocalDate birthday = archive.getBirthday();
            int age = today.getYear() - birthday.getYear();
            if (today.getDayOfYear() < birthday.getDayOfYear()) {
                age--;
            }
            archive.setAge(age);
        }

        // 保存到数据库
        save(archive);

        return archive;
    }

    /**
     * 生成档案编号
     * 档案编号组成：年份（4位）+一级机构编号（2位）+二级机构编号（2位）+三级机构编号（2位）+编号（2位）
     *
     * @param firstOrgId  一级机构ID
     * @param secondOrgId 二级机构ID
     * @param thirdOrgId  三级机构ID
     * @return 档案编号
     */
    private String generateArchiveNumber(Long firstOrgId, Long secondOrgId, Long thirdOrgId) {
        // 获取年份（4位）
        String year = String.valueOf(LocalDate.now().getYear());

        // 获取机构编号
        Organization firstOrg = organizationService.getById(firstOrgId);
        Organization secondOrg = organizationService.getById(secondOrgId);
        Organization thirdOrg = organizationService.getById(thirdOrgId);

        if (firstOrg == null || secondOrg == null || thirdOrg == null) {
            throw new RuntimeException("机构不存在");
        }

        // 获取机构编号，并补齐到2位
        String firstCode = String.format("%02d", Integer.parseInt(firstOrg.getOrgCode()));
        String secondCode = String.format("%02d", Integer.parseInt(secondOrg.getOrgCode()));
        String thirdCode = String.format("%02d", Integer.parseInt(thirdOrg.getOrgCode()));

        // 查询同机构下当年的所有记录，找出最大序号
        // 档案编号格式：年份4位+一级机构2位+二级机构2位+三级机构2位+序号2位
        LambdaQueryWrapper<EmployeeArchive> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(EmployeeArchive::getFirstOrgId, firstOrgId)
               .eq(EmployeeArchive::getSecondOrgId, secondOrgId)
               .eq(EmployeeArchive::getThirdOrgId, thirdOrgId)
               .likeRight(EmployeeArchive::getArchiveNumber, year + firstCode + secondCode + thirdCode)  // 匹配相同年份和机构编号
               .orderByDesc(EmployeeArchive::getArchiveNumber)
               .last("LIMIT 1");

        EmployeeArchive lastArchive = getOne(wrapper);
        int sequence = 1;

        if (lastArchive != null && lastArchive.getArchiveNumber() != null) {
            // 从档案编号中提取序号（最后2位）
            String lastNumber = lastArchive.getArchiveNumber();
            if (lastNumber.length() >= 12) {
                try {
                    // 档案编号格式：年份4位+一级机构2位+二级机构2位+三级机构2位+序号2位 = 12位
                    String sequenceStr = lastNumber.substring(10);  // 提取最后2位
                    sequence = Integer.parseInt(sequenceStr) + 1;
                } catch (NumberFormatException e) {
                    sequence = 1;
                }
            }
        }

        // 生成档案编号：年份4位+一级机构2位+二级机构2位+三级机构2位+序号2位
        String sequenceStr = String.format("%02d", sequence);
        return year + firstCode + secondCode + thirdCode + sequenceStr;
    }

    @Override
    public IPage<EmployeeArchive> getPendingReviewPage(int page, int size) {
        Page<EmployeeArchive> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<EmployeeArchive> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(EmployeeArchive::getStatus, EmployeeArchiveStatus.PENDING_REVIEW.getCode())
               .orderByDesc(EmployeeArchive::getRegistrationTime);
        return page(pageParam, wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean approveReview(Long archiveId, Long reviewerId, String reviewComments) {
        EmployeeArchive archive = getById(archiveId);
        if (archive == null) {
            throw new RuntimeException("档案不存在");
        }
        if (!EmployeeArchiveStatus.PENDING_REVIEW.getCode().equals(archive.getStatus())) {
            throw new RuntimeException("档案状态不是待复核，无法进行复核操作");
        }

        // 如果薪酬标准ID为空，尝试根据职位和职称自动关联已通过的薪酬标准
        Long salaryStandardId = archive.getSalaryStandardId();
        if (salaryStandardId == null && archive.getPositionId() != null && archive.getJobTitle() != null) {
            SalaryStandard standard = salaryStandardService.getApprovedByPositionIdAndJobTitle(
                    archive.getPositionId(), archive.getJobTitle());
            if (standard != null) {
                salaryStandardId = standard.getStandardId();
            }
        }

        LambdaUpdateWrapper<EmployeeArchive> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(EmployeeArchive::getArchiveId, archiveId)
               .set(EmployeeArchive::getStatus, EmployeeArchiveStatus.NORMAL.getCode())
               .set(EmployeeArchive::getReviewerId, reviewerId)
               .set(EmployeeArchive::getReviewTime, LocalDateTime.now())
               .set(EmployeeArchive::getReviewComments, reviewComments);
        
        // 如果找到了薪酬标准，自动关联
        if (salaryStandardId != null) {
            wrapper.set(EmployeeArchive::getSalaryStandardId, salaryStandardId);
        }

        return update(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean approveReviewWithUpdate(Long archiveId, EmployeeArchive updatedArchive, Long reviewerId, String reviewComments) {
        EmployeeArchive existingArchive = getById(archiveId);
        if (existingArchive == null) {
            throw new RuntimeException("档案不存在");
        }
        if (!EmployeeArchiveStatus.PENDING_REVIEW.getCode().equals(existingArchive.getStatus())) {
            throw new RuntimeException("档案状态不是待复核，无法进行复核操作");
        }

        // 确保不能修改的字段保持不变
        updatedArchive.setArchiveId(archiveId);
        updatedArchive.setArchiveNumber(existingArchive.getArchiveNumber());
        updatedArchive.setFirstOrgId(existingArchive.getFirstOrgId());
        updatedArchive.setSecondOrgId(existingArchive.getSecondOrgId());
        updatedArchive.setThirdOrgId(existingArchive.getThirdOrgId());
        updatedArchive.setPositionId(existingArchive.getPositionId());

        // 设置复核信息（将状态从 PENDING_REVIEW 改为 NORMAL）
        updatedArchive.setStatus(EmployeeArchiveStatus.NORMAL.getCode());
        updatedArchive.setReviewerId(reviewerId);
        updatedArchive.setReviewTime(LocalDateTime.now());
        updatedArchive.setReviewComments(reviewComments);

        // 保持登记信息不变
        updatedArchive.setRegistrarId(existingArchive.getRegistrarId());
        updatedArchive.setRegistrationTime(existingArchive.getRegistrationTime());

        // 如果提供了出生日期，自动计算年龄
        if (updatedArchive.getBirthday() != null && updatedArchive.getAge() == null) {
            LocalDate today = LocalDate.now();
            LocalDate birthday = updatedArchive.getBirthday();
            int age = today.getYear() - birthday.getYear();
            if (today.getDayOfYear() < birthday.getDayOfYear()) {
                age--;
            }
            updatedArchive.setAge(age);
        }

        // 如果薪酬标准ID为空，尝试根据职位和职称自动关联已通过的薪酬标准
        if (updatedArchive.getSalaryStandardId() == null && updatedArchive.getPositionId() != null && updatedArchive.getJobTitle() != null) {
            SalaryStandard standard = salaryStandardService.getApprovedByPositionIdAndJobTitle(
                    updatedArchive.getPositionId(), updatedArchive.getJobTitle());
            if (standard != null) {
                updatedArchive.setSalaryStandardId(standard.getStandardId());
            }
        }

        // 使用 updateById 更新所有字段（包括 null 字段，确保清空操作生效）
        // MyBatis-Plus 默认会忽略 null 字段，但我们已经将空字符串转换为 null
        // 为了确保所有字段都被更新，我们需要显式设置所有字段
        boolean result = updateById(updatedArchive);
        
        // 验证更新是否成功
        if (!result) {
            throw new RuntimeException("更新档案失败");
        }
        
        return true;
    }

    @Override
    public IPage<EmployeeArchive> queryEmployeeArchives(
            Long firstOrgId,
            Long secondOrgId,
            Long thirdOrgId,
            Long positionId,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            int page,
            int size) {
        Page<EmployeeArchive> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<EmployeeArchive> wrapper = new LambdaQueryWrapper<>();

        // 一级机构条件
        if (firstOrgId != null) {
            wrapper.eq(EmployeeArchive::getFirstOrgId, firstOrgId);
        }

        // 二级机构条件
        if (secondOrgId != null) {
            wrapper.eq(EmployeeArchive::getSecondOrgId, secondOrgId);
        }

        // 三级机构条件
        if (thirdOrgId != null) {
            wrapper.eq(EmployeeArchive::getThirdOrgId, thirdOrgId);
        }

        // 职位条件
        if (positionId != null) {
            wrapper.eq(EmployeeArchive::getPositionId, positionId);
        }

        // 建档时间范围条件
        if (startDate != null) {
            wrapper.ge(EmployeeArchive::getRegistrationTime, startDate.atStartOfDay());
        }
        if (endDate != null) {
            wrapper.le(EmployeeArchive::getRegistrationTime, endDate.atTime(23, 59, 59));
        }

        // 状态条件
        // 档案查询功能永远不显示已删除的档案
        // 无论status参数是什么，都排除已删除状态的档案
        wrapper.ne(EmployeeArchive::getStatus, EmployeeArchiveStatus.DELETED.getCode());
        
        // 如果指定了状态（且不是已删除状态），则按该状态查询
        if (status != null && !status.isEmpty() && !EmployeeArchiveStatus.DELETED.getCode().equals(status)) {
            wrapper.eq(EmployeeArchive::getStatus, status);
        }

        // 按登记时间倒序排列
        wrapper.orderByDesc(EmployeeArchive::getRegistrationTime);

        return page(pageParam, wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public EmployeeArchive updateEmployeeArchive(Long archiveId, EmployeeArchive updatedArchive) {
        EmployeeArchive existingArchive = getById(archiveId);
        if (existingArchive == null) {
            throw new RuntimeException("档案不存在");
        }

        // 确保不能修改的字段保持不变
        updatedArchive.setArchiveId(archiveId);
        updatedArchive.setArchiveNumber(existingArchive.getArchiveNumber());
        updatedArchive.setFirstOrgId(existingArchive.getFirstOrgId());
        updatedArchive.setSecondOrgId(existingArchive.getSecondOrgId());
        updatedArchive.setThirdOrgId(existingArchive.getThirdOrgId());
        updatedArchive.setPositionId(existingArchive.getPositionId());

        // 设置状态为待复核
        updatedArchive.setStatus(EmployeeArchiveStatus.PENDING_REVIEW.getCode());

        // 保持登记信息不变
        updatedArchive.setRegistrarId(existingArchive.getRegistrarId());
        updatedArchive.setRegistrationTime(existingArchive.getRegistrationTime());

        // 清除复核信息（因为需要重新复核）
        updatedArchive.setReviewerId(null);
        updatedArchive.setReviewTime(null);
        updatedArchive.setReviewComments(null);

        // 如果提供了出生日期，自动计算年龄
        if (updatedArchive.getBirthday() != null && updatedArchive.getAge() == null) {
            LocalDate today = LocalDate.now();
            LocalDate birthday = updatedArchive.getBirthday();
            int age = today.getYear() - birthday.getYear();
            if (today.getDayOfYear() < birthday.getDayOfYear()) {
                age--;
            }
            updatedArchive.setAge(age);
        }

        updateById(updatedArchive);

        return updatedArchive;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updatePhotoUrl(Long archiveId, String photoUrl) {
        EmployeeArchive archive = getById(archiveId);
        if (archive == null) {
            throw new RuntimeException("档案不存在");
        }

        // 如果存在旧照片，可以考虑删除旧文件（这里暂时不删除，保留历史记录）
        archive.setPhotoUrl(photoUrl);
        return updateById(archive);
    }
}

