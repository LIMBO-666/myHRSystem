package com.example.human.resource.archive.management.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.common.dto.*;
import com.example.common.entity.EmployeeArchive;
import com.example.common.entity.Organization;
import com.example.common.entity.Position;
import com.example.common.entity.User;
import com.example.common.enums.EmployeeArchiveStatus;
import com.example.storage.service.EmployeeArchiveService;
import com.example.storage.service.FileStorageService;
import com.example.storage.service.OrganizationService;
import com.example.storage.service.PositionService;
import com.example.storage.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 员工档案管理服务单元测试
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("员工档案管理服务单元测试")
class EmployeeArchiveManagementServiceTest {

    @Mock
    private EmployeeArchiveService employeeArchiveService;

    @Mock
    private OrganizationService organizationService;

    @Mock
    private PositionService positionService;

    @Mock
    private UserService userService;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private EmployeeArchiveManagementService archiveManagementService;

    private CreateEmployeeArchiveRequest createRequest;
    private EmployeeArchive testArchive;
    private Organization firstOrg, secondOrg, thirdOrg;
    private Position testPosition;
    private User testUser;

    @BeforeEach
    void setUp() {
        // 准备机构数据
        firstOrg = new Organization();
        firstOrg.setOrgId(1L);
        firstOrg.setOrgName("一级机构");
        firstOrg.setOrgLevel(1);
        firstOrg.setParentId(null);

        secondOrg = new Organization();
        secondOrg.setOrgId(2L);
        secondOrg.setOrgName("二级机构");
        secondOrg.setOrgLevel(2);
        secondOrg.setParentId(1L);

        thirdOrg = new Organization();
        thirdOrg.setOrgId(3L);
        thirdOrg.setOrgName("三级机构");
        thirdOrg.setOrgLevel(3);
        thirdOrg.setParentId(2L);

        // 准备职位数据
        testPosition = new Position();
        testPosition.setPositionId(1L);
        testPosition.setPositionName("测试职位");
        testPosition.setThirdOrgId(3L);

        // 准备用户数据
        testUser = new User();
        testUser.setUserId(1L);
        testUser.setUsername("hr01");
        testUser.setRealName("人事专员");

        // 准备创建请求
        createRequest = new CreateEmployeeArchiveRequest();
        createRequest.setName("张三");
        createRequest.setGender("MALE");
        createRequest.setIdNumber("110101199001011234");
        createRequest.setBirthday(LocalDate.of(1990, 1, 1));
        createRequest.setAge(34);
        createRequest.setFirstOrgId(1L);
        createRequest.setSecondOrgId(2L);
        createRequest.setThirdOrgId(3L);
        createRequest.setPositionId(1L);

        // 准备档案数据
        testArchive = new EmployeeArchive();
        testArchive.setArchiveId(1L);
        testArchive.setArchiveNumber("20240101010101");
        testArchive.setName("张三");
        testArchive.setGender("MALE");
        testArchive.setStatus(EmployeeArchiveStatus.PENDING_REVIEW.getCode());
        testArchive.setFirstOrgId(1L);
        testArchive.setSecondOrgId(2L);
        testArchive.setThirdOrgId(3L);
        testArchive.setPositionId(1L);
        testArchive.setRegistrarId(1L);
    }

    @Test
    @DisplayName("档案登记 - 完整信息应该成功创建")
    void testCreateEmployeeArchive_Success() {
        // Given
        // validateOrganizationHierarchy会调用3次getById
        when(organizationService.getById(1L)).thenReturn(firstOrg);
        when(organizationService.getById(2L)).thenReturn(secondOrg);
        when(organizationService.getById(3L)).thenReturn(thirdOrg);
        // validatePosition会调用1次getById
        when(positionService.getById(1L)).thenReturn(testPosition);
        when(employeeArchiveService.createEmployeeArchive(any(EmployeeArchive.class), eq(1L)))
                .thenReturn(testArchive);
        // convertToResponse会调用多次getById
        lenient().when(organizationService.getById(1L)).thenReturn(firstOrg);
        lenient().when(organizationService.getById(2L)).thenReturn(secondOrg);
        lenient().when(organizationService.getById(3L)).thenReturn(thirdOrg);
        lenient().when(positionService.getById(1L)).thenReturn(testPosition);
        lenient().when(userService.getById(1L)).thenReturn(testUser);

        // When
        EmployeeArchiveResponse response = archiveManagementService.createEmployeeArchive(createRequest, 1L);

        // Then
        assertNotNull(response);
        assertEquals("张三", response.getName());
        assertEquals("MALE", response.getGender());
        // validateOrganizationHierarchy会调用3次getById，convertToResponse也会调用，所以至少调用2次
        verify(organizationService, atLeast(2)).getById(1L);
        verify(organizationService, atLeast(2)).getById(2L);
        verify(organizationService, atLeast(2)).getById(3L);
        // validatePosition和convertToResponse都会调用，所以至少调用2次
        verify(positionService, atLeast(2)).getById(1L);
        verify(employeeArchiveService, times(1)).createEmployeeArchive(any(), eq(1L));
    }

    @Test
    @DisplayName("档案登记 - 必填项验证：姓名为空应该抛出异常")
    void testCreateEmployeeArchive_NameRequired() {
        // Given
        createRequest.setName(null);

        // When & Then
        assertThrows(Exception.class, () -> {
            archiveManagementService.createEmployeeArchive(createRequest, 1L);
        });
    }

    @Test
    @DisplayName("档案登记 - 机构层级验证：一级机构不存在应该抛出异常")
    void testCreateEmployeeArchive_InvalidFirstOrg() {
        // Given
        when(organizationService.getById(1L)).thenReturn(null);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            archiveManagementService.createEmployeeArchive(createRequest, 1L);
        });

        assertTrue(exception.getMessage().contains("一级机构不存在"));
        verify(organizationService, times(1)).getById(1L);
    }

    @Test
    @DisplayName("档案登记 - 机构层级验证：二级机构不属于一级机构应该抛出异常")
    void testCreateEmployeeArchive_InvalidSecondOrg() {
        // Given
        secondOrg.setParentId(999L); // 错误的父机构ID
        when(organizationService.getById(1L)).thenReturn(firstOrg);
        when(organizationService.getById(2L)).thenReturn(secondOrg);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            archiveManagementService.createEmployeeArchive(createRequest, 1L);
        });

        assertTrue(exception.getMessage().contains("二级机构不存在或不属于指定的一级机构"));
    }

    @Test
    @DisplayName("档案登记 - 职位验证：职位不属于三级机构应该抛出异常")
    void testCreateEmployeeArchive_InvalidPosition() {
        // Given
        testPosition.setThirdOrgId(999L); // 错误的机构ID
        when(organizationService.getById(1L)).thenReturn(firstOrg);
        when(organizationService.getById(2L)).thenReturn(secondOrg);
        when(organizationService.getById(3L)).thenReturn(thirdOrg);
        when(positionService.getById(1L)).thenReturn(testPosition);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            archiveManagementService.createEmployeeArchive(createRequest, 1L);
        });

        assertTrue(exception.getMessage().contains("职位不属于指定的三级机构"));
    }

    @Test
    @DisplayName("照片上传 - 应该成功上传并更新档案")
    void testUploadPhoto_Success() {
        // Given
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.getOriginalFilename()).thenReturn("photo.jpg");
        when(employeeArchiveService.getById(1L)).thenReturn(testArchive);
        when(fileStorageService.saveFile(any(), eq("photos"), anyString()))
                .thenReturn("/photos/20240101010101.jpg");
        when(employeeArchiveService.updatePhotoUrl(1L, "/photos/20240101010101.jpg")).thenReturn(true);

        // When
        String photoUrl = archiveManagementService.uploadPhoto(1L, mockFile);

        // Then
        assertNotNull(photoUrl);
        assertEquals("/photos/20240101010101.jpg", photoUrl);
        verify(employeeArchiveService, times(1)).getById(1L);
        verify(fileStorageService, times(1)).saveFile(any(), eq("photos"), anyString());
        verify(employeeArchiveService, times(1)).updatePhotoUrl(1L, photoUrl);
    }

    @Test
    @DisplayName("照片上传 - 档案不存在应该抛出异常")
    void testUploadPhoto_ArchiveNotFound() {
        // Given
        MultipartFile mockFile = mock(MultipartFile.class);
        when(employeeArchiveService.getById(1L)).thenReturn(null);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            archiveManagementService.uploadPhoto(1L, mockFile);
        });

        assertEquals("档案不存在", exception.getMessage());
        verify(employeeArchiveService, times(1)).getById(1L);
        verify(fileStorageService, never()).saveFile(any(), anyString(), anyString());
    }

    @Test
    @DisplayName("档案复核通过 - 应该成功更新状态")
    void testApproveReview_Success() {
        // Given
        ReviewApproveRequest request = new ReviewApproveRequest();
        request.setReviewComments("审核通过");
        
        testArchive.setStatus(EmployeeArchiveStatus.PENDING_REVIEW.getCode());
        when(employeeArchiveService.approveReview(eq(1L), eq(1L), anyString())).thenReturn(true);
        when(employeeArchiveService.getById(1L)).thenReturn(testArchive);
        // convertToResponse会调用这些方法
        lenient().when(organizationService.getById(1L)).thenReturn(firstOrg);
        lenient().when(organizationService.getById(2L)).thenReturn(secondOrg);
        lenient().when(organizationService.getById(3L)).thenReturn(thirdOrg);
        lenient().when(positionService.getById(1L)).thenReturn(testPosition);
        lenient().when(userService.getById(1L)).thenReturn(testUser);

        // When
        EmployeeArchiveResponse response = archiveManagementService.approveReview(1L, request, 1L);

        // Then
        assertNotNull(response);
        verify(employeeArchiveService, times(1)).approveReview(eq(1L), eq(1L), anyString());
        verify(employeeArchiveService, atLeastOnce()).getById(1L); // approveReview后和convertToResponse中都会调用
    }

    @Test
    @DisplayName("档案复核通过 - 复核失败应该抛出异常")
    void testApproveReview_Failed() {
        // Given
        ReviewApproveRequest request = new ReviewApproveRequest();
        lenient().when(employeeArchiveService.approveReview(eq(1L), eq(1L), anyString())).thenReturn(false);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            archiveManagementService.approveReview(1L, request, 1L);
        });

        assertEquals("复核失败", exception.getMessage());
    }

    // 注意：当前系统中没有实现档案复核驳回功能，此测试已注释
    // 如果需要实现驳回功能，需要在 EmployeeArchiveManagementService 和 EmployeeArchiveService 中添加 rejectReview 方法
    /*
    @Test
    @DisplayName("档案复核驳回 - 应该成功更新状态")
    void testRejectReview_Success() {
        // Given
        ReviewRejectRequest request = new ReviewRejectRequest();
        request.setRejectReason("信息不完整");
        
        testArchive.setStatus(EmployeeArchiveStatus.PENDING_REVIEW.getCode());
        when(employeeArchiveService.rejectReview(eq(1L), eq(1L), anyString())).thenReturn(true);
        when(employeeArchiveService.getById(1L)).thenReturn(testArchive);
        // convertToResponse会调用这些方法
        lenient().when(organizationService.getById(1L)).thenReturn(firstOrg);
        lenient().when(organizationService.getById(2L)).thenReturn(secondOrg);
        lenient().when(organizationService.getById(3L)).thenReturn(thirdOrg);
        lenient().when(positionService.getById(1L)).thenReturn(testPosition);
        lenient().when(userService.getById(1L)).thenReturn(testUser);

        // When
        EmployeeArchiveResponse response = archiveManagementService.rejectReview(1L, request, 1L);

        // Then
        assertNotNull(response);
        verify(employeeArchiveService, times(1)).rejectReview(eq(1L), eq(1L), anyString());
    }
    */

    @Test
    @DisplayName("档案查询 - 多条件查询应该返回分页结果")
    void testQueryEmployeeArchives_MultipleConditions() {
        // Given
        Page<EmployeeArchive> page = new Page<>(1, 10);
        page.setTotal(1);
        page.setRecords(List.of(testArchive));
        
        when(employeeArchiveService.queryEmployeeArchives(
                eq(1L), eq(2L), eq(3L), eq(1L), 
                any(LocalDate.class), any(LocalDate.class), 
                eq(EmployeeArchiveStatus.PENDING_REVIEW.getCode()),
                eq(1), eq(10)
        )).thenReturn(page);
        // convertToResponse会调用这些方法
        lenient().when(organizationService.getById(1L)).thenReturn(firstOrg);
        lenient().when(organizationService.getById(2L)).thenReturn(secondOrg);
        lenient().when(organizationService.getById(3L)).thenReturn(thirdOrg);
        lenient().when(positionService.getById(1L)).thenReturn(testPosition);
        lenient().when(userService.getById(1L)).thenReturn(testUser);

        // When
        PageResponse<EmployeeArchiveResponse> response = archiveManagementService.queryEmployeeArchives(
                1L, 2L, 3L, 1L, 
                LocalDate.of(2024, 1, 1), 
                LocalDate.of(2024, 12, 31),
                EmployeeArchiveStatus.PENDING_REVIEW.getCode(),
                1, 10
        );

        // Then
        assertNotNull(response);
        assertEquals(1, response.getTotal());
        assertEquals(1, response.getList().size());
        verify(employeeArchiveService, times(1)).queryEmployeeArchives(
                eq(1L), eq(2L), eq(3L), eq(1L), 
                any(), any(), anyString(), eq(1), eq(10)
        );
    }

    @Test
    @DisplayName("档案更新 - 应该成功更新并变为待复核状态")
    void testUpdateEmployeeArchive_Success() {
        // Given
        UpdateEmployeeArchiveRequest request = new UpdateEmployeeArchiveRequest();
        request.setName("李四");
        request.setEmail("lisi@example.com");
        
        EmployeeArchive updatedArchive = new EmployeeArchive();
        updatedArchive.setArchiveId(1L);
        updatedArchive.setName("李四");
        updatedArchive.setEmail("lisi@example.com");
        updatedArchive.setStatus(EmployeeArchiveStatus.PENDING_REVIEW.getCode());
        
        when(employeeArchiveService.getById(1L)).thenReturn(testArchive);
        when(employeeArchiveService.updateEmployeeArchive(eq(1L), any(EmployeeArchive.class)))
                .thenReturn(updatedArchive);
        // convertToResponse会调用这些方法
        lenient().when(organizationService.getById(1L)).thenReturn(firstOrg);
        lenient().when(organizationService.getById(2L)).thenReturn(secondOrg);
        lenient().when(organizationService.getById(3L)).thenReturn(thirdOrg);
        lenient().when(positionService.getById(1L)).thenReturn(testPosition);
        lenient().when(userService.getById(1L)).thenReturn(testUser);

        // When
        EmployeeArchiveResponse response = archiveManagementService.updateEmployeeArchive(1L, request);

        // Then
        assertNotNull(response);
        verify(employeeArchiveService, times(1)).getById(1L);
        verify(employeeArchiveService, times(1)).updateEmployeeArchive(eq(1L), any());
    }

    @Test
    @DisplayName("档案更新 - 档案不存在应该抛出异常")
    void testUpdateEmployeeArchive_NotFound() {
        // Given
        UpdateEmployeeArchiveRequest request = new UpdateEmployeeArchiveRequest();
        when(employeeArchiveService.getById(1L)).thenReturn(null);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            archiveManagementService.updateEmployeeArchive(1L, request);
        });

        assertEquals("档案不存在", exception.getMessage());
    }

    @Test
    @DisplayName("档案删除 - 应该成功软删除")
    void testDeleteEmployeeArchive_Success() {
        // Given
        testArchive.setStatus(EmployeeArchiveStatus.DELETED.getCode());
        when(employeeArchiveService.softDelete(eq(1L), anyString())).thenReturn(true);
        when(employeeArchiveService.getById(1L)).thenReturn(testArchive);
        // convertToResponse会调用这些方法
        lenient().when(organizationService.getById(1L)).thenReturn(firstOrg);
        lenient().when(organizationService.getById(2L)).thenReturn(secondOrg);
        lenient().when(organizationService.getById(3L)).thenReturn(thirdOrg);
        lenient().when(positionService.getById(1L)).thenReturn(testPosition);
        lenient().when(userService.getById(1L)).thenReturn(testUser);

        // When
        EmployeeArchiveResponse response = archiveManagementService.deleteEmployeeArchive(1L, "测试删除");

        // Then
        assertNotNull(response);
        verify(employeeArchiveService, times(1)).softDelete(eq(1L), eq("测试删除"));
    }

    @Test
    @DisplayName("档案删除 - 删除失败应该抛出异常")
    void testDeleteEmployeeArchive_Failed() {
        // Given
        when(employeeArchiveService.softDelete(eq(1L), anyString())).thenReturn(false);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            archiveManagementService.deleteEmployeeArchive(1L, "测试删除");
        });

        assertEquals("删除失败", exception.getMessage());
    }

    @Test
    @DisplayName("档案恢复 - 应该成功恢复")
    void testRestoreEmployeeArchive_Success() {
        // Given
        testArchive.setStatus(EmployeeArchiveStatus.NORMAL.getCode());
        when(employeeArchiveService.restore(1L)).thenReturn(true);
        when(employeeArchiveService.getById(1L)).thenReturn(testArchive);
        // convertToResponse会调用这些方法
        lenient().when(organizationService.getById(1L)).thenReturn(firstOrg);
        lenient().when(organizationService.getById(2L)).thenReturn(secondOrg);
        lenient().when(organizationService.getById(3L)).thenReturn(thirdOrg);
        lenient().when(positionService.getById(1L)).thenReturn(testPosition);
        lenient().when(userService.getById(1L)).thenReturn(testUser);

        // When
        EmployeeArchiveResponse response = archiveManagementService.restoreEmployeeArchive(1L);

        // Then
        assertNotNull(response);
        verify(employeeArchiveService, times(1)).restore(1L);
    }

    @Test
    @DisplayName("档案恢复 - 恢复失败应该抛出异常")
    void testRestoreEmployeeArchive_Failed() {
        // Given
        when(employeeArchiveService.restore(1L)).thenReturn(false);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            archiveManagementService.restoreEmployeeArchive(1L);
        });

        assertEquals("恢复失败", exception.getMessage());
    }

    @Test
    @DisplayName("获取待复核档案列表 - 应该返回分页结果")
    void testGetPendingReviewList() {
        // Given
        Page<EmployeeArchive> page = new Page<>(1, 10);
        page.setTotal(1);
        page.setRecords(List.of(testArchive));
        
        when(employeeArchiveService.getPendingReviewPage(1, 10)).thenReturn(page);
        // convertToResponse会调用这些方法
        lenient().when(organizationService.getById(1L)).thenReturn(firstOrg);
        lenient().when(organizationService.getById(2L)).thenReturn(secondOrg);
        lenient().when(organizationService.getById(3L)).thenReturn(thirdOrg);
        lenient().when(positionService.getById(1L)).thenReturn(testPosition);
        lenient().when(userService.getById(1L)).thenReturn(testUser);

        // When
        PageResponse<EmployeeArchiveResponse> response = archiveManagementService.getPendingReviewList(1, 10);

        // Then
        assertNotNull(response);
        assertEquals(1, response.getTotal());
        assertEquals(1, response.getList().size());
    }

    @Test
    @DisplayName("获取档案详情 - 应该返回档案信息")
    void testGetArchiveDetail_Success() {
        // Given
        when(employeeArchiveService.getById(1L)).thenReturn(testArchive);
        // convertToResponse会调用这些方法
        lenient().when(organizationService.getById(1L)).thenReturn(firstOrg);
        lenient().when(organizationService.getById(2L)).thenReturn(secondOrg);
        lenient().when(organizationService.getById(3L)).thenReturn(thirdOrg);
        lenient().when(positionService.getById(1L)).thenReturn(testPosition);
        lenient().when(userService.getById(1L)).thenReturn(testUser);

        // When
        EmployeeArchiveResponse response = archiveManagementService.getArchiveDetail(1L);

        // Then
        assertNotNull(response);
        assertEquals("张三", response.getName());
        verify(employeeArchiveService, times(1)).getById(1L);
    }

    @Test
    @DisplayName("获取档案详情 - 档案不存在应该抛出异常")
    void testGetArchiveDetail_NotFound() {
        // Given
        when(employeeArchiveService.getById(1L)).thenReturn(null);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            archiveManagementService.getArchiveDetail(1L);
        });

        assertEquals("档案不存在", exception.getMessage());
    }
}
