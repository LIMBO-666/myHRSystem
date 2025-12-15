package com.example.storage.service.Impl;

import com.example.common.entity.Organization;
import com.example.storage.service.OrganizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import com.baomidou.mybatisplus.core.conditions.Wrapper;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 机构服务单元测试
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("机构服务单元测试")
class OrganizationServiceImplTest {

    @Spy
    @InjectMocks
    private OrganizationServiceImpl organizationServiceImpl;

    private Organization firstOrg;
    private Organization secondOrg;
    private Organization thirdOrg;

    @BeforeEach
    void setUp() {
        // 准备一级机构
        firstOrg = new Organization();
        firstOrg.setOrgId(1L);
        firstOrg.setOrgName("一级机构");
        firstOrg.setOrgLevel(1);
        firstOrg.setParentId(null);

        // 准备二级机构
        secondOrg = new Organization();
        secondOrg.setOrgId(2L);
        secondOrg.setOrgName("二级机构");
        secondOrg.setOrgLevel(2);
        secondOrg.setParentId(1L);

        // 准备三级机构
        thirdOrg = new Organization();
        thirdOrg.setOrgId(3L);
        thirdOrg.setOrgName("三级机构");
        thirdOrg.setOrgLevel(3);
        thirdOrg.setParentId(2L);
    }

    @Test
    @DisplayName("机构三级联动 - 获取一级机构列表")
    void testGetFirstLevelOrgs() {
        // Given
        doReturn(List.of(firstOrg)).when(organizationServiceImpl).getByOrgLevel(1);

        // When
        List<Organization> result = organizationServiceImpl.getFirstLevelOrgs();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1, result.get(0).getOrgLevel());
        verify(organizationServiceImpl, times(1)).getByOrgLevel(1);
    }

    @Test
    @DisplayName("机构三级联动 - 根据一级机构获取二级机构")
    void testGetSecondLevelOrgs() {
        // Given
        doReturn(List.of(secondOrg)).when(organizationServiceImpl).list(any(Wrapper.class));

        // When
        List<Organization> result = organizationServiceImpl.getSecondLevelOrgs(1L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(2, result.get(0).getOrgLevel());
        assertEquals(1L, result.get(0).getParentId());
    }

    @Test
    @DisplayName("机构三级联动 - 根据二级机构获取三级机构")
    void testGetThirdLevelOrgs() {
        // Given
        doReturn(List.of(thirdOrg)).when(organizationServiceImpl).list(any(Wrapper.class));

        // When
        List<Organization> result = organizationServiceImpl.getThirdLevelOrgs(2L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(3, result.get(0).getOrgLevel());
        assertEquals(2L, result.get(0).getParentId());
    }

    @Test
    @DisplayName("机构三级联动 - 根据一级机构获取所有三级机构")
    void testGetThirdLevelOrgsByFirstOrgId() {
        // Given
        doReturn(List.of(secondOrg))
                .doReturn(List.of(thirdOrg))
                .when(organizationServiceImpl).list(any(Wrapper.class));

        // When
        List<Organization> result = organizationServiceImpl.getThirdLevelOrgsByFirstOrgId(1L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(3, result.get(0).getOrgLevel());
    }

    @Test
    @DisplayName("机构三级联动 - 一级机构下无二级机构应返回空列表")
    void testGetThirdLevelOrgsByFirstOrgId_NoSecondOrgs() {
        // Given
        doReturn(new ArrayList<>()).when(organizationServiceImpl).list(any(Wrapper.class));

        // When
        List<Organization> result = organizationServiceImpl.getThirdLevelOrgsByFirstOrgId(1L);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("根据父机构ID获取子机构")
    void testGetByParentId() {
        // Given
        doReturn(List.of(secondOrg)).when(organizationServiceImpl).list(any(Wrapper.class));

        // When
        List<Organization> result = organizationServiceImpl.getByParentId(1L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getParentId());
    }

    @Test
    @DisplayName("根据机构级别获取机构列表")
    void testGetByOrgLevel() {
        // Given
        doReturn(List.of(firstOrg)).when(organizationServiceImpl).list(any(Wrapper.class));

        // When
        List<Organization> result = organizationServiceImpl.getByOrgLevel(1);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1, result.get(0).getOrgLevel());
    }
}
