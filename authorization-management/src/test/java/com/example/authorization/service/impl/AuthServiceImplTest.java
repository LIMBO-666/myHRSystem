package com.example.authorization.service.impl;

import com.example.authorization.dto.LoginRequest;
import com.example.authorization.dto.LoginResponse;
import com.example.common.entity.User;
import com.example.common.enums.UserStatus;
import com.example.common.exception.AuthenticationException;
import com.example.common.util.JwtUtil;
import com.example.storage.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * 认证服务单元测试
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("认证服务单元测试")
class AuthServiceImplTest {

    @Mock
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        // 准备测试数据
        testUser = new User();
        testUser.setUserId(1L);
        testUser.setUsername("hr01");
        testUser.setPassword("$2a$10$encodedPassword");
        testUser.setRealName("人事专员");
        testUser.setRole("HR_SPECIALIST");
        testUser.setStatus(UserStatus.ACTIVE.getCode());

        loginRequest = new LoginRequest();
        loginRequest.setUsername("hr01");
        loginRequest.setPassword("password123");
    }

    @Test
    @DisplayName("正常登录 - 应该成功返回Token")
    void testLogin_Success() {
        // Given
        when(userService.getByUsername("hr01")).thenReturn(testUser);
        when(passwordEncoder.matches("password123", testUser.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(any(User.class))).thenReturn("test-access-token");
        when(jwtUtil.generateRefreshToken(any(User.class))).thenReturn("test-refresh-token");
        when(jwtUtil.getExpirationTime()).thenReturn(3600L);

        // When
        LoginResponse response = authService.login(loginRequest);

        // Then
        assertNotNull(response);
        assertEquals("test-access-token", response.getToken());
        assertEquals("test-refresh-token", response.getRefreshToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals(1L, response.getUserId());
        assertEquals("hr01", response.getUsername());
        assertEquals("人事专员", response.getRealName());
        assertEquals("HR_SPECIALIST", response.getRole());
        assertNotNull(response.getUser());

        verify(userService, times(1)).getByUsername("hr01");
        verify(passwordEncoder, times(1)).matches("password123", testUser.getPassword());
        verify(jwtUtil, times(1)).generateToken(testUser);
        verify(jwtUtil, times(1)).generateRefreshToken(testUser);
    }

    @Test
    @DisplayName("错误密码登录 - 应该抛出认证异常")
    void testLogin_WrongPassword() {
        // Given
        when(userService.getByUsername("hr01")).thenReturn(testUser);
        when(passwordEncoder.matches("wrongPassword", testUser.getPassword())).thenReturn(false);

        loginRequest.setPassword("wrongPassword");

        // When & Then
        AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("用户名或密码错误", exception.getMessage());
        verify(userService, times(1)).getByUsername("hr01");
        verify(passwordEncoder, times(1)).matches("wrongPassword", testUser.getPassword());
        verify(jwtUtil, never()).generateToken(any());
    }

    @Test
    @DisplayName("用户不存在 - 应该抛出认证异常")
    void testLogin_UserNotFound() {
        // Given
        when(userService.getByUsername("nonexistent")).thenReturn(null);

        loginRequest.setUsername("nonexistent");

        // When & Then
        AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("用户名或密码错误", exception.getMessage());
        verify(userService, times(1)).getByUsername("nonexistent");
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtUtil, never()).generateToken(any());
    }

    @Test
    @DisplayName("用户被禁用 - 应该抛出认证异常")
    void testLogin_UserDisabled() {
        // Given
        testUser.setStatus(UserStatus.INACTIVE.getCode());
        when(userService.getByUsername("hr01")).thenReturn(testUser);
        when(passwordEncoder.matches("password123", testUser.getPassword())).thenReturn(true);

        // When & Then
        AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("用户已被禁用", exception.getMessage());
        verify(userService, times(1)).getByUsername("hr01");
        verify(passwordEncoder, times(1)).matches("password123", testUser.getPassword());
        verify(jwtUtil, never()).generateToken(any());
    }

    @Test
    @DisplayName("刷新Token - 应该成功返回新Token")
    void testRefreshToken_Success() {
        // Given
        String refreshToken = "valid-refresh-token";
        when(jwtUtil.validateToken(refreshToken)).thenReturn(true);
        when(jwtUtil.isRefreshToken(refreshToken)).thenReturn(true);
        when(jwtUtil.getUsernameFromToken(refreshToken)).thenReturn("hr01");
        when(userService.getByUsername("hr01")).thenReturn(testUser);
        when(jwtUtil.generateToken(any(User.class))).thenReturn("new-access-token");
        when(jwtUtil.generateRefreshToken(any(User.class))).thenReturn("new-refresh-token");
        when(jwtUtil.getExpirationTime()).thenReturn(3600L);

        // When
        LoginResponse response = authService.refreshToken(refreshToken);

        // Then
        assertNotNull(response);
        assertEquals("new-access-token", response.getToken());
        assertEquals("new-refresh-token", response.getRefreshToken());
        verify(jwtUtil, times(1)).validateToken(refreshToken);
        verify(jwtUtil, times(1)).isRefreshToken(refreshToken);
        verify(jwtUtil, times(1)).getUsernameFromToken(refreshToken);
        verify(userService, times(1)).getByUsername("hr01");
    }

    @Test
    @DisplayName("刷新Token - Token无效应该抛出异常")
    void testRefreshToken_InvalidToken() {
        // Given
        String invalidToken = "invalid-token";
        when(jwtUtil.validateToken(invalidToken)).thenReturn(false);

        // When & Then
        AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
            authService.refreshToken(invalidToken);
        });

        assertEquals("Token无效或已过期", exception.getMessage());
        verify(jwtUtil, times(1)).validateToken(invalidToken);
        verify(jwtUtil, never()).isRefreshToken(anyString());
    }

    @Test
    @DisplayName("刷新Token - 非Refresh Token应该抛出异常")
    void testRefreshToken_NotRefreshToken() {
        // Given
        String accessToken = "access-token";
        when(jwtUtil.validateToken(accessToken)).thenReturn(true);
        when(jwtUtil.isRefreshToken(accessToken)).thenReturn(false);

        // When & Then
        AuthenticationException exception = assertThrows(AuthenticationException.class, () -> {
            authService.refreshToken(accessToken);
        });

        assertEquals("无效的Refresh Token", exception.getMessage());
        verify(jwtUtil, times(1)).validateToken(accessToken);
        verify(jwtUtil, times(1)).isRefreshToken(accessToken);
    }

    @Test
    @DisplayName("验证Token - 应该返回验证结果")
    void testValidateToken() {
        // Given
        String token = "test-token";
        when(jwtUtil.validateToken(token)).thenReturn(true);

        // When
        boolean result = authService.validateToken(token);

        // Then
        assertTrue(result);
        verify(jwtUtil, times(1)).validateToken(token);
    }

    @Test
    @DisplayName("登出 - 应该正常执行")
    void testLogout() {
        // Given
        String token = "test-token";

        // When
        authService.logout(token);

        // Then - 当前实现为空，只验证不抛异常
        assertDoesNotThrow(() -> authService.logout(token));
    }
}
