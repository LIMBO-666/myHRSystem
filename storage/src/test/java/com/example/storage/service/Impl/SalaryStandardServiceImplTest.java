package com.example.storage.service.Impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.common.dto.CreateSalaryStandardRequest;
import com.example.common.dto.SalaryStandardItemRequest;
import com.example.common.dto.UpdateSalaryStandardRequest;
import com.example.common.entity.EmployeeArchive;
import com.example.common.entity.SalaryItem;
import com.example.common.entity.SalaryStandard;
import com.example.common.entity.SalaryStandardItem;
import com.example.common.enums.EmployeeArchiveStatus;
import com.example.common.enums.SalaryStandardStatus;
import com.example.storage.service.EmployeeArchiveService;
import com.example.storage.service.SalaryItemService;
import com.example.storage.service.SalaryStandardItemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 薪酬标准服务单元测试
 */
@ExtendWith(MockitoExtension.class)
@SpringBootTest(classes = com.example.storage.StorageTestApplication.class)
@ActiveProfiles("test")
@Transactional
@DisplayName("薪酬标准服务单元测试")
class SalaryStandardServiceImplTest {

    @Mock
    private SalaryStandardItemService salaryStandardItemService;

    @Mock
    private SalaryItemService salaryItemService;

    @Mock
    private EmployeeArchiveService employeeArchiveService;

    @Spy
    @InjectMocks
    private SalaryStandardServiceImpl salaryStandardService;

    private CreateSalaryStandardRequest createRequest;
    private SalaryStandard testStandard;
    private SalaryItem basicSalaryItem;
    private List<SalaryStandardItemRequest> itemRequests;

    @BeforeEach
    void setUp() {
        // 准备基本工资项目
        basicSalaryItem = new SalaryItem();
        basicSalaryItem.setItemId(1L);
        basicSalaryItem.setItemCode("S001");
        basicSalaryItem.setItemName("基本工资");
        basicSalaryItem.setItemType("INCOME");

        // 准备创建请求
        createRequest = new CreateSalaryStandardRequest();
        createRequest.setStandardName("前端工程师-中级标准");
        createRequest.setPositionId(1L);
        createRequest.setJobTitle("INTERMEDIATE");
        createRequest.setFormulatorId(1L);

        // 准备薪酬项目明细
        itemRequests = new ArrayList<>();
        SalaryStandardItemRequest item1 = new SalaryStandardItemRequest();
        item1.setItemId(1L);
        item1.setAmount(new BigDecimal("10000.00"));
        item1.setIsCalculated(false);
        itemRequests.add(item1);

        createRequest.setItems(itemRequests);

        // 准备测试薪酬标准
        testStandard = new SalaryStandard();
        testStandard.setStandardId(1L);
        testStandard.setStandardCode("SAL202401001");
        testStandard.setStandardName("前端工程师-中级标准");
        testStandard.setPositionId(1L);
        testStandard.setJobTitle("INTERMEDIATE");
        testStandard.setFormulatorId(1L);
        testStandard.setRegistrarId(1L);
        testStandard.setStatus(SalaryStandardStatus.PENDING_REVIEW.getCode());
        testStandard.setRegistrationTime(LocalDateTime.now());
    }

    @Test
    @DisplayName("薪酬标准登记 - 应该成功创建新标准")
    void testCreateSalaryStandard_Success() {
        // Given
        doReturn(null).when(salaryStandardService).getApprovedByPositionIdAndJobTitle(1L, "INTERMEDIATE");
        when(salaryItemService.getById(1L)).thenReturn(basicSalaryItem);
        // Mock saveStandardItems内部调用的listByIds方法
        lenient().when(salaryItemService.listByIds(anyList())).thenReturn(List.of(basicSalaryItem));
        // deleteByStandardId返回boolean
        lenient().when(salaryStandardItemService.deleteByStandardId(anyLong())).thenReturn(true);
        lenient().when(salaryStandardItemService.save(any(SalaryStandardItem.class))).thenReturn(true);
        doReturn(true).when(salaryStandardService).save(any(SalaryStandard.class));
        // Mock generateStandardCode内部调用的getOne方法
        lenient().doReturn(null).when(salaryStandardService).getOne(any(com.baomidou.mybatisplus.core.conditions.Wrapper.class));

        // When
        SalaryStandard result = salaryStandardService.createSalaryStandard(createRequest, 1L);

        // Then
        assertNotNull(result);
        assertNotNull(result.getStandardCode());
        assertEquals("前端工程师-中级标准", result.getStandardName());
        assertEquals(SalaryStandardStatus.PENDING_REVIEW.getCode(), result.getStatus());
        verify(salaryStandardService, times(1)).save(any(SalaryStandard.class));
    }

    @Test
    @DisplayName("薪酬标准登记 - 存在已通过标准时应该更新")
    void testCreateSalaryStandard_UpdateExisting() {
        // Given
        SalaryStandard existingStandard = new SalaryStandard();
        existingStandard.setStandardId(2L);
        existingStandard.setStandardCode("SAL202401002");
        existingStandard.setStatus(SalaryStandardStatus.APPROVED.getCode());

        doReturn(existingStandard).when(salaryStandardService).getApprovedByPositionIdAndJobTitle(1L, "INTERMEDIATE");
        doReturn(existingStandard).when(salaryStandardService).getById(2L);
        when(salaryItemService.getById(1L)).thenReturn(basicSalaryItem);
        // Mock saveStandardItems内部调用的listByIds方法
        lenient().when(salaryItemService.listByIds(anyList())).thenReturn(List.of(basicSalaryItem));
        // deleteByStandardId返回boolean
        lenient().when(salaryStandardItemService.deleteByStandardId(2L)).thenReturn(true);
        lenient().when(salaryStandardItemService.save(any(SalaryStandardItem.class))).thenReturn(true);
        doReturn(true).when(salaryStandardService).updateById(any(SalaryStandard.class));

        // When
        SalaryStandard result = salaryStandardService.createSalaryStandard(createRequest, 1L);

        // Then
        assertNotNull(result);
        assertEquals("SAL202401002", result.getStandardCode()); // 保持原编号
        assertEquals(SalaryStandardStatus.PENDING_REVIEW.getCode(), result.getStatus()); // 状态变为待复核
        verify(salaryStandardItemService, times(1)).deleteByStandardId(2L);
    }

    @Test
    @DisplayName("薪酬标准复核通过 - 应该成功更新状态")
    void testApproveReview_Success() {
        // Given - 只测试验证逻辑，不执行实际更新
        testStandard.setStatus(SalaryStandardStatus.PENDING_REVIEW.getCode());
        doReturn(testStandard).when(salaryStandardService).getById(1L);
        // Mock update方法 - 使用ArgumentMatchers.any()匹配任何类型，避免LambdaUpdateWrapper创建
        doReturn(true).when(salaryStandardService).update(org.mockito.ArgumentMatchers.any());
        // Mock approveReview内部再次调用getById
        doReturn(testStandard).when(salaryStandardService).getById(1L);
        // Mock list方法（用于查询员工档案）
        doReturn(new ArrayList<>()).when(employeeArchiveService).getByPositionId(anyLong());

        // When
        boolean result = salaryStandardService.approveReview(1L, 1L, "审核通过");

        // Then
        assertTrue(result);
        verify(salaryStandardService, times(1)).update(org.mockito.ArgumentMatchers.any());
    }

    @Test
    @DisplayName("薪酬标准复核通过 - 状态不是待复核应该抛出异常")
    void testApproveReview_InvalidStatus() {
        // Given
        testStandard.setStatus(SalaryStandardStatus.APPROVED.getCode());
        doReturn(testStandard).when(salaryStandardService).getById(1L);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            salaryStandardService.approveReview(1L, 1L, "审核通过");
        });

        assertTrue(exception.getMessage().contains("状态不是待复核"));
    }

    @Test
    @DisplayName("薪酬标准复核驳回 - 应该成功更新状态")
    void testRejectReview_Success() {
        // Given
        testStandard.setStatus(SalaryStandardStatus.PENDING_REVIEW.getCode());
        doReturn(testStandard).when(salaryStandardService).getById(1L);
        // Mock update方法 - 匹配任何Wrapper类型
        doReturn(true).when(salaryStandardService).update(org.mockito.ArgumentMatchers.any());

        // When
        boolean result = salaryStandardService.rejectReview(1L, 1L, "信息不完整");

        // Then
        assertTrue(result);
        verify(salaryStandardService, times(1)).update(any());
    }

    @Test
    @DisplayName("薪酬标准复核驳回 - 状态不是待复核应该抛出异常")
    void testRejectReview_InvalidStatus() {
        // Given
        testStandard.setStatus(SalaryStandardStatus.APPROVED.getCode());
        doReturn(testStandard).when(salaryStandardService).getById(1L);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            salaryStandardService.rejectReview(1L, 1L, "驳回");
        });

        assertTrue(exception.getMessage().contains("状态不是待复核"));
    }

    @Test
    @DisplayName("更新薪酬标准 - 应该成功更新")
    void testUpdateSalaryStandard_Success() {
        // Given
        testStandard.setStatus(SalaryStandardStatus.PENDING_REVIEW.getCode());
        UpdateSalaryStandardRequest updateRequest = new UpdateSalaryStandardRequest();
        updateRequest.setStandardName("更新后的标准名称");
        updateRequest.setItems(itemRequests);

        doReturn(testStandard).when(salaryStandardService).getById(1L);
        doReturn(true).when(salaryStandardService).updateById(any(SalaryStandard.class));
        when(salaryItemService.getById(1L)).thenReturn(basicSalaryItem);
        // Mock saveStandardItems内部调用的listByIds方法
        when(salaryItemService.listByIds(anyList())).thenReturn(List.of(basicSalaryItem));
        // deleteByStandardId返回boolean
        when(salaryStandardItemService.deleteByStandardId(1L)).thenReturn(true);
        when(salaryStandardItemService.save(any(SalaryStandardItem.class))).thenReturn(true);

        // When
        SalaryStandard result = salaryStandardService.updateSalaryStandard(1L, updateRequest);

        // Then
        assertNotNull(result);
        assertEquals("更新后的标准名称", result.getStandardName());
        assertEquals(SalaryStandardStatus.PENDING_REVIEW.getCode(), result.getStatus());
        verify(salaryStandardItemService, times(1)).deleteByStandardId(1L);
    }

    @Test
    @DisplayName("更新薪酬标准 - 已通过状态不能更新")
    void testUpdateSalaryStandard_ApprovedStatus() {
        // Given
        testStandard.setStatus(SalaryStandardStatus.APPROVED.getCode());
        UpdateSalaryStandardRequest updateRequest = new UpdateSalaryStandardRequest();

        doReturn(testStandard).when(salaryStandardService).getById(1L);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            salaryStandardService.updateSalaryStandard(1L, updateRequest);
        });

        assertTrue(exception.getMessage().contains("只有待复核或已驳回状态的薪酬标准才能更新"));
    }

    @Test
    @DisplayName("查询薪酬标准 - 应该返回分页结果")
    void testQuerySalaryStandards() {
        // Given
        Page<SalaryStandard> page = new Page<>(1, 10);
        page.setTotal(1);
        page.setRecords(List.of(testStandard));

        doReturn(page).when(salaryStandardService).page(any(Page.class), any(com.baomidou.mybatisplus.core.conditions.Wrapper.class));

        // When
        IPage<SalaryStandard> result = salaryStandardService.querySalaryStandards(
                null, null, null, null, null, null, null, 1, 10);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotal());
        assertEquals(1, result.getRecords().size());
    }

    @Test
    @DisplayName("获取待复核薪酬标准列表 - 应该返回待复核状态的标准")
    void testGetPendingReviewPage() {
        // Given
        Page<SalaryStandard> page = new Page<>(1, 10);
        page.setTotal(1);
        page.setRecords(List.of(testStandard));

        doReturn(page).when(salaryStandardService).page(any(Page.class), any(com.baomidou.mybatisplus.core.conditions.Wrapper.class));

        // When
        IPage<SalaryStandard> result = salaryStandardService.getPendingReviewPage(1, 10);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotal());
    }

    @Test
    @DisplayName("根据职位和职称获取已通过的薪酬标准 - 应该返回标准")
    void testGetApprovedByPositionIdAndJobTitle() {
        // Given
        testStandard.setStatus(SalaryStandardStatus.APPROVED.getCode());
        doReturn(List.of(testStandard)).when(salaryStandardService).list(any(com.baomidou.mybatisplus.core.conditions.Wrapper.class));

        // When
        SalaryStandard result = salaryStandardService.getApprovedByPositionIdAndJobTitle(1L, "INTERMEDIATE");

        // Then
        assertNotNull(result);
        assertEquals(SalaryStandardStatus.APPROVED.getCode(), result.getStatus());
    }
}
