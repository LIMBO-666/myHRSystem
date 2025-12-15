package com.example.storage.service.Impl;

import com.example.common.entity.Organization;
import com.example.common.entity.Position;
import com.example.storage.service.OrganizationService;
import com.example.storage.service.PositionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import com.baomidou.mybatisplus.core.conditions.Wrapper;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 职位服务单元测试
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("职位服务单元测试")
class PositionServiceImplTest {

    @Mock
    private OrganizationService organizationService;

    @Spy
    @InjectMocks
    private PositionServiceImpl positionServiceImpl;

    private Position testPosition;
    private Organization thirdOrg;

    @BeforeEach
    void setUp() {
        // 准备三级机构
        thirdOrg = new Organization();
        thirdOrg.setOrgId(3L);
        thirdOrg.setOrgName("三级机构");
        thirdOrg.setOrgLevel(3);
        thirdOrg.setParentId(2L);

        // 准备职位
        testPosition = new Position();
        testPosition.setPositionId(1L);
        testPosition.setPositionName("前端工程师");
        testPosition.setThirdOrgId(3L);
        testPosition.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("职位管理 - 根据三级机构ID获取职位列表")
    void testGetByThirdOrgId() {
        // Given
        doReturn(List.of(testPosition)).when(positionServiceImpl).list(any(Wrapper.class));

        // When
        List<Position> result = positionServiceImpl.getByThirdOrgId(3L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(3L, result.get(0).getThirdOrgId());
        assertEquals("前端工程师", result.get(0).getPositionName());
    }

    @Test
    @DisplayName("职位管理 - 根据职位名称获取职位")
    void testGetByPositionName() {
        // Given
        doReturn(testPosition).when(positionServiceImpl).getOne(any());

        // When
        Position result = positionServiceImpl.getByPositionName("前端工程师");

        // Then
        assertNotNull(result);
        assertEquals("前端工程师", result.getPositionName());
    }

    @Test
    @DisplayName("职位管理 - 根据一级机构ID获取职位列表")
    void testGetByFirstOrgId() {
        // Given
        Organization secondOrg = new Organization();
        secondOrg.setOrgId(2L);
        secondOrg.setParentId(1L);

        when(organizationService.getSecondLevelOrgs(1L)).thenReturn(List.of(secondOrg));
        when(organizationService.getThirdLevelOrgs(2L)).thenReturn(List.of(thirdOrg));
        doReturn(List.of(testPosition)).when(positionServiceImpl).list(any(Wrapper.class));

        // When
        List<Position> result = positionServiceImpl.getByFirstOrgId(1L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(3L, result.get(0).getThirdOrgId());
    }

    @Test
    @DisplayName("职位管理 - 根据二级机构ID获取职位列表")
    void testGetBySecondOrgId() {
        // Given
        when(organizationService.getThirdLevelOrgs(2L)).thenReturn(List.of(thirdOrg));
        doReturn(List.of(testPosition)).when(positionServiceImpl).list(any(Wrapper.class));

        // When
        List<Position> result = positionServiceImpl.getBySecondOrgId(2L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(3L, result.get(0).getThirdOrgId());
    }

    @Test
    @DisplayName("职位管理 - 一级机构下无三级机构应返回空列表")
    void testGetByFirstOrgId_NoThirdOrgs() {
        // Given
        when(organizationService.getSecondLevelOrgs(1L)).thenReturn(new ArrayList<>());

        // When
        List<Position> result = positionServiceImpl.getByFirstOrgId(1L);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
