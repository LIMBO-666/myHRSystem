package com.example.authorization.controller;

import com.example.authorization.dto.LoginRequest;
import com.example.authorization.dto.LoginResponse;
import com.example.authorization.service.AuthService;
import com.example.common.dto.ApiResponse;
import com.example.common.exception.AuthenticationException;
import com.example.common.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 认证控制器单元测试
 */
@WebMvcTest(controllers = AuthController.class, 
        excludeAutoConfiguration = {
            org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
            org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class
        })
@DisplayName("认证控制器单元测试")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    private LoginRequest loginRequest;
    private LoginResponse loginResponse;

    @BeforeEach
    void setUp() {
        loginRequest = new LoginRequest();
        loginRequest.setUsername("hr01");
        loginRequest.setPassword("password123");

        loginResponse = LoginResponse.builder()
                .token("test-token")
                .accessToken("test-token")
                .refreshToken("test-refresh-token")
                .tokenType("Bearer")
                .userId(1L)
                .username("hr01")
                .realName("人事专员")
                .role("HR_SPECIALIST")
                .expiresIn(3600L)
                .build();
    }

    @Test
    @DisplayName("正常登录 - 应该返回200和Token")
    void testLogin_Success() throws Exception {
        // Given
        when(authService.login(any(LoginRequest.class))).thenReturn(loginResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("登录成功"))
                .andExpect(jsonPath("$.data.token").value("test-token"))
                .andExpect(jsonPath("$.data.username").value("hr01"));

        verify(authService, times(1)).login(any(LoginRequest.class));
    }

    @Test
    @DisplayName("错误密码登录 - 应该返回错误响应")
    void testLogin_WrongPassword() throws Exception {
        // Given
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new AuthenticationException("用户名或密码错误"));

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500)) // ApiResponse.error()返回500
                .andExpect(jsonPath("$.message").value("用户名或密码错误"));

        verify(authService, times(1)).login(any(LoginRequest.class));
    }

    @Test
    @DisplayName("登出 - 应该返回成功")
    void testLogout_Success() throws Exception {
        // Given
        doNothing().when(authService).logout(anyString());

        // When & Then
        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer test-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("登出成功"));

        verify(authService, times(1)).logout("test-token");
    }

    @Test
    @DisplayName("刷新Token - 应该返回新Token")
    void testRefreshToken_Success() throws Exception {
        // Given
        when(authService.refreshToken(anyString())).thenReturn(loginResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/refresh")
                        .header("Authorization", "Bearer test-refresh-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Token刷新成功"))
                .andExpect(jsonPath("$.data.token").value("test-token"));

        verify(authService, times(1)).refreshToken("test-refresh-token");
    }

    @Test
    @DisplayName("刷新Token - Token无效应该返回错误")
    void testRefreshToken_InvalidToken() throws Exception {
        // Given
        when(authService.refreshToken(anyString()))
                .thenThrow(new AuthenticationException("Token无效或已过期"));

        // When & Then
        mockMvc.perform(post("/api/auth/refresh")
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500)) // ApiResponse.error()返回500
                .andExpect(jsonPath("$.message").value("Token无效或已过期"));

        verify(authService, times(1)).refreshToken("invalid-token");
    }

    @Test
    @DisplayName("验证Token - 有效Token应该返回true")
    void testValidateToken_Valid() throws Exception {
        // Given
        when(authService.validateToken(anyString())).thenReturn(true);

        // When & Then
        mockMvc.perform(get("/api/auth/validate")
                        .header("Authorization", "Bearer test-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Token有效"))
                .andExpect(jsonPath("$.data").value(true));

        verify(authService, times(1)).validateToken("test-token");
    }

    @Test
    @DisplayName("验证Token - 无效Token应该返回false")
    void testValidateToken_Invalid() throws Exception {
        // Given
        when(authService.validateToken(anyString())).thenReturn(false);

        // When & Then
        mockMvc.perform(get("/api/auth/validate")
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Token无效"))
                .andExpect(jsonPath("$.data").value(false));

        verify(authService, times(1)).validateToken("invalid-token");
    }
}
