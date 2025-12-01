package com.example.human.resource.archive.management.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.common.dto.*;
import com.example.common.entity.EmployeeArchive;
import com.example.common.entity.Organization;
import com.example.common.entity.Position;
import com.example.common.entity.User;
import com.example.storage.service.EmployeeArchiveService;
import com.example.storage.service.FileStorageService;
import com.example.storage.service.OrganizationService;
import com.example.storage.service.PositionService;
import com.example.storage.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 人力资源档案管理 Service
 */
@Service
@RequiredArgsConstructor
public class EmployeeArchiveManagementService {

    private final EmployeeArchiveService employeeArchiveService;
    private final OrganizationService organizationService;
    private final PositionService positionService;
    private final UserService userService;
    private final FileStorageService fileStorageService;

    /**
     * 创建员工档案
     *
     * @param request 创建请求
     * @param registrarId 登记人ID
     * @return 员工档案响应
     */
    @Transactional(rollbackFor = Exception.class)
    public EmployeeArchiveResponse createEmployeeArchive(CreateEmployeeArchiveRequest request, Long registrarId) {
        // 验证机构关系
        validateOrganizationHierarchy(request.getFirstOrgId(), request.getSecondOrgId(), request.getThirdOrgId());

        // 验证职位是否属于三级机构
        validatePosition(request.getPositionId(), request.getThirdOrgId());

        // 转换为实体对象
        EmployeeArchive archive = new EmployeeArchive();
        BeanUtils.copyProperties(request, archive);

        // 设置默认值
        if (archive.getNationality() == null || archive.getNationality().isEmpty()) {
            archive.setNationality("中国");
        }

        // 创建员工档案
        EmployeeArchive savedArchive = employeeArchiveService.createEmployeeArchive(archive, registrarId);

        // 转换为响应对象
        return convertToResponse(savedArchive);
    }

    /**
     * 验证机构层级关系
     */
    private void validateOrganizationHierarchy(Long firstOrgId, Long secondOrgId, Long thirdOrgId) {
        Organization firstOrg = organizationService.getById(firstOrgId);
        if (firstOrg == null || firstOrg.getOrgLevel() != 1) {
            throw new RuntimeException("一级机构不存在或无效");
        }

        Organization secondOrg = organizationService.getById(secondOrgId);
        if (secondOrg == null || secondOrg.getOrgLevel() != 2 || !secondOrg.getParentId().equals(firstOrgId)) {
            throw new RuntimeException("二级机构不存在或不属于指定的一级机构");
        }

        Organization thirdOrg = organizationService.getById(thirdOrgId);
        if (thirdOrg == null || thirdOrg.getOrgLevel() != 3 || !thirdOrg.getParentId().equals(secondOrgId)) {
            throw new RuntimeException("三级机构不存在或不属于指定的二级机构");
        }
    }

    /**
     * 验证职位是否属于三级机构
     */
    private void validatePosition(Long positionId, Long thirdOrgId) {
        Position position = positionService.getById(positionId);
        if (position == null) {
            throw new RuntimeException("职位不存在");
        }
        if (!position.getThirdOrgId().equals(thirdOrgId)) {
            throw new RuntimeException("职位不属于指定的三级机构");
        }
    }

    /**
     * 转换为响应对象
     */
    private EmployeeArchiveResponse convertToResponse(EmployeeArchive archive) {
        EmployeeArchiveResponse response = new EmployeeArchiveResponse();
        BeanUtils.copyProperties(archive, response);

        // 填充机构信息
        if (archive.getFirstOrgId() != null) {
            Organization firstOrg = organizationService.getById(archive.getFirstOrgId());
            if (firstOrg != null) {
                response.setFirstOrgName(firstOrg.getOrgName());
            }
        }
        if (archive.getSecondOrgId() != null) {
            Organization secondOrg = organizationService.getById(archive.getSecondOrgId());
            if (secondOrg != null) {
                response.setSecondOrgName(secondOrg.getOrgName());
            }
        }
        if (archive.getThirdOrgId() != null) {
            Organization thirdOrg = organizationService.getById(archive.getThirdOrgId());
            if (thirdOrg != null) {
                response.setThirdOrgName(thirdOrg.getOrgName());
            }
        }

        // 构建机构全路径
        if (response.getFirstOrgName() != null && response.getSecondOrgName() != null && response.getThirdOrgName() != null) {
            response.setOrgFullPath(response.getFirstOrgName() + "/" + response.getSecondOrgName() + "/" + response.getThirdOrgName());
        }

        // 填充职位信息
        if (archive.getPositionId() != null) {
            Position position = positionService.getById(archive.getPositionId());
            if (position != null) {
                response.setPositionName(position.getPositionName());
            }
        }

        // 填充登记人信息
        if (archive.getRegistrarId() != null) {
            User registrar = userService.getById(archive.getRegistrarId());
            if (registrar != null) {
                response.setRegistrarName(registrar.getRealName());
            }
        }

        // 填充复核人信息
        if (archive.getReviewerId() != null) {
            User reviewer = userService.getById(archive.getReviewerId());
            if (reviewer != null) {
                response.setReviewerName(reviewer.getRealName());
            }
        }

        return response;
    }

    /**
     * 获取待复核档案列表（分页）
     *
     * @param page 页码
     * @param size 每页数量
     * @return 分页响应
     */
    public PageResponse<EmployeeArchiveResponse> getPendingReviewList(int page, int size) {
        IPage<EmployeeArchive> pageResult = employeeArchiveService.getPendingReviewPage(page, size);
        
        List<EmployeeArchiveResponse> responseList = pageResult.getRecords().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return PageResponse.<EmployeeArchiveResponse>builder()
                .total(pageResult.getTotal())
                .list(responseList)
                .build();
    }

    /**
     * 获取档案详情
     *
     * @param archiveId 档案ID
     * @return 档案详情
     */
    public EmployeeArchiveResponse getArchiveDetail(Long archiveId) {
        EmployeeArchive archive = employeeArchiveService.getById(archiveId);
        if (archive == null) {
            throw new RuntimeException("档案不存在");
        }
        return convertToResponse(archive);
    }

    /**
     * 复核通过（不修改信息）
     *
     * @param archiveId 档案ID
     * @param request 复核请求
     * @param reviewerId 复核人ID
     * @return 响应
     */
    @Transactional(rollbackFor = Exception.class)
    public EmployeeArchiveResponse approveReview(Long archiveId, ReviewApproveRequest request, Long reviewerId) {
        boolean success = employeeArchiveService.approveReview(
                archiveId,
                reviewerId,
                request.getReviewComments()
        );

        if (!success) {
            throw new RuntimeException("复核失败");
        }

        EmployeeArchive archive = employeeArchiveService.getById(archiveId);
        return convertToResponse(archive);
    }

    /**
     * 复核通过（修改后通过）
     *
     * @param archiveId 档案ID
     * @param request 复核并修改请求
     * @param reviewerId 复核人ID
     * @return 响应
     */
    @Transactional(rollbackFor = Exception.class)
    public EmployeeArchiveResponse approveReviewWithUpdate(Long archiveId, ReviewWithUpdateRequest request, Long reviewerId) {
        // 检查是否通过复核
        if (request.getApprove() == null || !request.getApprove()) {
            throw new RuntimeException("复核操作必须设置为通过（approve=true）");
        }

        // 获取现有档案
        EmployeeArchive existingArchive = employeeArchiveService.getById(archiveId);
        if (existingArchive == null) {
            throw new RuntimeException("档案不存在");
        }

        // 创建更新后的档案对象
        EmployeeArchive updatedArchive = new EmployeeArchive();
        BeanUtils.copyProperties(existingArchive, updatedArchive);

        // 只更新请求中提供的字段（除了不能修改的字段）
        if (request.getName() != null) {
            updatedArchive.setName(request.getName());
        }
        if (request.getGender() != null) {
            updatedArchive.setGender(request.getGender());
        }
        if (request.getIdNumber() != null) {
            updatedArchive.setIdNumber(request.getIdNumber());
        }
        if (request.getBirthday() != null) {
            updatedArchive.setBirthday(request.getBirthday());
        }
        if (request.getAge() != null) {
            updatedArchive.setAge(request.getAge());
        }
        if (request.getNationality() != null) {
            updatedArchive.setNationality(request.getNationality());
        }
        if (request.getPlaceOfBirth() != null) {
            updatedArchive.setPlaceOfBirth(request.getPlaceOfBirth());
        }
        if (request.getEthnicity() != null) {
            updatedArchive.setEthnicity(request.getEthnicity());
        }
        if (request.getReligiousBelief() != null) {
            updatedArchive.setReligiousBelief(request.getReligiousBelief());
        }
        if (request.getPoliticalStatus() != null) {
            updatedArchive.setPoliticalStatus(request.getPoliticalStatus());
        }
        if (request.getEducationLevel() != null) {
            updatedArchive.setEducationLevel(request.getEducationLevel());
        }
        if (request.getMajor() != null) {
            updatedArchive.setMajor(request.getMajor());
        }
        if (request.getEmail() != null) {
            updatedArchive.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            updatedArchive.setPhone(request.getPhone());
        }
        if (request.getQq() != null) {
            updatedArchive.setQq(request.getQq());
        }
        if (request.getMobile() != null) {
            updatedArchive.setMobile(request.getMobile());
        }
        if (request.getAddress() != null) {
            updatedArchive.setAddress(request.getAddress());
        }
        if (request.getPostalCode() != null) {
            updatedArchive.setPostalCode(request.getPostalCode());
        }
        if (request.getHobby() != null) {
            updatedArchive.setHobby(request.getHobby());
        }
        if (request.getPersonalResume() != null) {
            updatedArchive.setPersonalResume(request.getPersonalResume());
        }
        if (request.getFamilyRelationship() != null) {
            updatedArchive.setFamilyRelationship(request.getFamilyRelationship());
        }
        if (request.getRemarks() != null) {
            updatedArchive.setRemarks(request.getRemarks());
        }
        if (request.getJobTitle() != null) {
            updatedArchive.setJobTitle(request.getJobTitle());
        }
        if (request.getSalaryStandardId() != null) {
            updatedArchive.setSalaryStandardId(request.getSalaryStandardId());
        }
        if (request.getPhotoUrl() != null) {
            updatedArchive.setPhotoUrl(request.getPhotoUrl());
        }

        // 执行复核
        boolean success = employeeArchiveService.approveReviewWithUpdate(
                archiveId,
                updatedArchive,
                reviewerId,
                request.getReviewComments()
        );

        if (!success) {
            throw new RuntimeException("复核失败");
        }

        EmployeeArchive archive = employeeArchiveService.getById(archiveId);
        return convertToResponse(archive);
    }

    /**
     * 查询员工档案（支持多条件查询和分页）
     *
     * @param firstOrgId 一级机构ID（可选）
     * @param secondOrgId 二级机构ID（可选）
     * @param thirdOrgId 三级机构ID（可选）
     * @param positionId 职位ID（可选）
     * @param startDate 建档起始日期（可选）
     * @param endDate 建档结束日期（可选）
     * @param status 状态（可选）
     * @param page 页码
     * @param size 每页数量
     * @return 分页响应
     */
    public PageResponse<EmployeeArchiveResponse> queryEmployeeArchives(
            Long firstOrgId,
            Long secondOrgId,
            Long thirdOrgId,
            Long positionId,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate,
            String status,
            int page,
            int size) {
        IPage<EmployeeArchive> pageResult = employeeArchiveService.queryEmployeeArchives(
                firstOrgId,
                secondOrgId,
                thirdOrgId,
                positionId,
                startDate,
                endDate,
                status,
                page,
                size
        );

        List<EmployeeArchiveResponse> responseList = pageResult.getRecords().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return PageResponse.<EmployeeArchiveResponse>builder()
                .total(pageResult.getTotal())
                .list(responseList)
                .build();
    }

    /**
     * 更新员工档案
     * 档案编号、所属机构和职位不能修改
     * 更新后状态变为待复核
     *
     * @param archiveId 档案ID
     * @param request 更新请求
     * @return 更新后的员工档案响应
     */
    @Transactional(rollbackFor = Exception.class)
    public EmployeeArchiveResponse updateEmployeeArchive(Long archiveId, com.example.common.dto.UpdateEmployeeArchiveRequest request) {
        // 获取现有档案
        EmployeeArchive existingArchive = employeeArchiveService.getById(archiveId);
        if (existingArchive == null) {
            throw new RuntimeException("档案不存在");
        }

        // 创建更新后的档案对象
        EmployeeArchive updatedArchive = new EmployeeArchive();
        BeanUtils.copyProperties(existingArchive, updatedArchive);

        // 只更新请求中提供的字段（除了不能修改的字段）
        if (request.getName() != null) {
            updatedArchive.setName(request.getName());
        }
        if (request.getGender() != null) {
            updatedArchive.setGender(request.getGender());
        }
        if (request.getIdNumber() != null) {
            updatedArchive.setIdNumber(request.getIdNumber());
        }
        if (request.getBirthday() != null) {
            updatedArchive.setBirthday(request.getBirthday());
        }
        if (request.getAge() != null) {
            updatedArchive.setAge(request.getAge());
        }
        if (request.getNationality() != null) {
            updatedArchive.setNationality(request.getNationality());
        }
        if (request.getPlaceOfBirth() != null) {
            updatedArchive.setPlaceOfBirth(request.getPlaceOfBirth());
        }
        if (request.getEthnicity() != null) {
            updatedArchive.setEthnicity(request.getEthnicity());
        }
        if (request.getReligiousBelief() != null) {
            updatedArchive.setReligiousBelief(request.getReligiousBelief());
        }
        if (request.getPoliticalStatus() != null) {
            updatedArchive.setPoliticalStatus(request.getPoliticalStatus());
        }
        if (request.getEducationLevel() != null) {
            updatedArchive.setEducationLevel(request.getEducationLevel());
        }
        if (request.getMajor() != null) {
            updatedArchive.setMajor(request.getMajor());
        }
        if (request.getEmail() != null) {
            updatedArchive.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            updatedArchive.setPhone(request.getPhone());
        }
        if (request.getQq() != null) {
            updatedArchive.setQq(request.getQq());
        }
        if (request.getMobile() != null) {
            updatedArchive.setMobile(request.getMobile());
        }
        if (request.getAddress() != null) {
            updatedArchive.setAddress(request.getAddress());
        }
        if (request.getPostalCode() != null) {
            updatedArchive.setPostalCode(request.getPostalCode());
        }
        if (request.getHobby() != null) {
            updatedArchive.setHobby(request.getHobby());
        }
        if (request.getPersonalResume() != null) {
            updatedArchive.setPersonalResume(request.getPersonalResume());
        }
        if (request.getFamilyRelationship() != null) {
            updatedArchive.setFamilyRelationship(request.getFamilyRelationship());
        }
        if (request.getRemarks() != null) {
            updatedArchive.setRemarks(request.getRemarks());
        }
        if (request.getJobTitle() != null) {
            updatedArchive.setJobTitle(request.getJobTitle());
        }
        if (request.getSalaryStandardId() != null) {
            updatedArchive.setSalaryStandardId(request.getSalaryStandardId());
        }
        if (request.getPhotoUrl() != null) {
            updatedArchive.setPhotoUrl(request.getPhotoUrl());
        }

        // 执行更新
        EmployeeArchive savedArchive = employeeArchiveService.updateEmployeeArchive(archiveId, updatedArchive);

        // 转换为响应对象
        return convertToResponse(savedArchive);
    }

    /**
     * 获取已删除档案列表（分页）
     *
     * @param page 页码
     * @param size 每页数量
     * @return 分页响应
     */
    public PageResponse<EmployeeArchiveResponse> getDeletedList(int page, int size) {
        IPage<EmployeeArchive> pageResult = employeeArchiveService.getDeletedPage(page, size);

        List<EmployeeArchiveResponse> responseList = pageResult.getRecords().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return PageResponse.<EmployeeArchiveResponse>builder()
                .total(pageResult.getTotal())
                .list(responseList)
                .build();
    }

    /**
     * 删除员工档案（软删除）
     *
     * @param archiveId 档案ID
     * @param deleteReason 删除原因
     * @return 删除后的员工档案响应
     */
    @Transactional(rollbackFor = Exception.class)
    public EmployeeArchiveResponse deleteEmployeeArchive(Long archiveId, String deleteReason) {
        boolean success = employeeArchiveService.softDelete(archiveId, deleteReason);
        if (!success) {
            throw new RuntimeException("删除失败");
        }

        EmployeeArchive archive = employeeArchiveService.getById(archiveId);
        return convertToResponse(archive);
    }

    /**
     * 恢复已删除的员工档案
     *
     * @param archiveId 档案ID
     * @return 恢复后的员工档案响应
     */
    @Transactional(rollbackFor = Exception.class)
    public EmployeeArchiveResponse restoreEmployeeArchive(Long archiveId) {
        boolean success = employeeArchiveService.restore(archiveId);
        if (!success) {
            throw new RuntimeException("恢复失败");
        }

        EmployeeArchive archive = employeeArchiveService.getById(archiveId);
        return convertToResponse(archive);
    }

    /**
     * 上传员工照片
     *
     * @param archiveId 档案ID
     * @param file 照片文件
     * @return 照片URL
     */
    @Transactional(rollbackFor = Exception.class)
    public String uploadPhoto(Long archiveId, org.springframework.web.multipart.MultipartFile file) {
        // 验证档案是否存在
        EmployeeArchive archive = employeeArchiveService.getById(archiveId);
        if (archive == null) {
            throw new RuntimeException("档案不存在");
        }

        // 生成文件名（使用档案编号）
        String fileName = archive.getArchiveNumber() != null 
                ? archive.getArchiveNumber() + ".jpg"
                : null;

        // 保存文件
        String photoUrl = fileStorageService.saveFile(file, "photos", fileName);

        // 更新档案中的照片URL
        employeeArchiveService.updatePhotoUrl(archiveId, photoUrl);

        return photoUrl;
    }
}

