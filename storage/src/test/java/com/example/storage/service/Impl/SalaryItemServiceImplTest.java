package com.example.storage.service.Impl;

import com.example.common.entity.SalaryItem;
import com.example.storage.service.SalaryItemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import com.baomidou.mybatisplus.core.conditions.Wrapper;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 薪酬项目服务单元测试
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("薪酬项目服务单元测试")
class SalaryItemServiceImplTest {

    @Spy
    @InjectMocks
    private SalaryItemServiceImpl salaryItemServiceImpl;

    private SalaryItem incomeItem;
    private SalaryItem deductionItem;

    @BeforeEach
    void setUp() {
        // 准备收入项
        incomeItem = new SalaryItem();
        incomeItem.setItemId(1L);
        incomeItem.setItemCode("S001");
        incomeItem.setItemName("基本工资");
        incomeItem.setItemType("INCOME");
        incomeItem.setStatus("ACTIVE");

        // 准备扣除项
        deductionItem = new SalaryItem();
        deductionItem.setItemId(2L);
        deductionItem.setItemCode("D001");
        deductionItem.setItemName("养老保险");
        deductionItem.setItemType("DEDUCTION");
        deductionItem.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("薪酬项目管理 - 根据项目类型获取项目列表")
    void testGetByItemType() {
        // Given
        doReturn(List.of(incomeItem)).when(salaryItemServiceImpl).list(any(Wrapper.class));

        // When
        List<SalaryItem> result = salaryItemServiceImpl.getByItemType("INCOME");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("INCOME", result.get(0).getItemType());
        verify(salaryItemServiceImpl, times(1)).list(any(Wrapper.class));
    }

    @Test
    @DisplayName("薪酬项目管理 - 获取所有收入项")
    void testGetIncomeItems() {
        // Given
        doReturn(List.of(incomeItem)).when(salaryItemServiceImpl).list(any(Wrapper.class));

        // When
        List<SalaryItem> result = salaryItemServiceImpl.getIncomeItems();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("INCOME", result.get(0).getItemType());
        verify(salaryItemServiceImpl, times(1)).list(any(Wrapper.class));
    }

    @Test
    @DisplayName("薪酬项目管理 - 获取所有扣除项")
    void testGetDeductionItems() {
        // Given
        doReturn(List.of(deductionItem)).when(salaryItemServiceImpl).list(any(Wrapper.class));

        // When
        List<SalaryItem> result = salaryItemServiceImpl.getDeductionItems();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("DEDUCTION", result.get(0).getItemType());
        verify(salaryItemServiceImpl, times(1)).list(any(Wrapper.class));
    }

    @Test
    @DisplayName("薪酬项目管理 - 根据项目编号获取项目")
    void testGetByItemCode() {
        // Given
        doReturn(incomeItem).when(salaryItemServiceImpl).getOne(any());

        // When
        SalaryItem result = salaryItemServiceImpl.getByItemCode("S001");

        // Then
        assertNotNull(result);
        assertEquals("S001", result.getItemCode());
        assertEquals("基本工资", result.getItemName());
        verify(salaryItemServiceImpl, times(1)).getOne(any());
    }

    @Test
    @DisplayName("薪酬项目管理 - 根据排序顺序获取项目")
    void testGetBySortOrder() {
        // Given
        incomeItem.setSortOrder(1);
        doReturn(incomeItem).when(salaryItemServiceImpl).getOne(any());

        // When
        SalaryItem result = salaryItemServiceImpl.getBySortOrder(1);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getSortOrder());
        verify(salaryItemServiceImpl, times(1)).getOne(any());
    }

    @Test
    @DisplayName("薪酬项目管理 - 根据项目编号获取项目（包括已禁用的）")
    void testGetByItemCodeIncludingInactive() {
        // Given
        incomeItem.setStatus("INACTIVE");
        doReturn(incomeItem).when(salaryItemServiceImpl).getOne(any());

        // When
        SalaryItem result = salaryItemServiceImpl.getByItemCodeIncludingInactive("S001");

        // Then
        assertNotNull(result);
        assertEquals("S001", result.getItemCode());
        assertEquals("INACTIVE", result.getStatus());
        verify(salaryItemServiceImpl, times(1)).getOne(any());
    }
}
