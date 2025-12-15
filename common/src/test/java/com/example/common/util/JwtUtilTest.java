package com.example.common.util;

import com.example.common.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

/**
 * JWT工具类单元测试
 */
@DisplayName("JWT工具类单元测试")
class JwtUtilTest {

    private JwtUtil jwtUtil;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        // 设置测试用的密钥和过期时间
        ReflectionTestUtils.setField(jwtUtil, "secret", "testSecretKeyForJWTTokenGeneration2024TestOnly");
        ReflectionTestUtils.setField(jwtUtil, "expiration", 3600000L); // 1小时
        ReflectionTestUtils.setField(jwtUtil, "refreshExpiration", 604800000L); // 7天

        testUser = new User();
        testUser.setUserId(1L);
        testUser.setUsername("hr01");
        testUser.setRole("HR_SPECIALIST");
    }

    @Test
    @DisplayName("生成Access Token - 应该成功生成")
    void testGenerateToken_Success() {
        // When
        String token = jwtUtil.generateToken(testUser);

        // Then
        assertNotNull(token);
        assertFalse(token.isEmpty());
        
        // 验证Token可以解析
        Claims claims = jwtUtil.getClaimsFromToken(token);
        assertNotNull(claims);
        assertEquals("hr01", claims.getSubject());
        assertEquals(1L, claims.get("userId", Long.class));
        assertEquals("HR_SPECIALIST", claims.get("role", String.class));
        assertEquals("access", claims.get("type", String.class));
    }

    @Test
    @DisplayName("生成Refresh Token - 应该成功生成")
    void testGenerateRefreshToken_Success() {
        // When
        String refreshToken = jwtUtil.generateRefreshToken(testUser);

        // Then
        assertNotNull(refreshToken);
        assertFalse(refreshToken.isEmpty());
        
        // 验证Token可以解析
        Claims claims = jwtUtil.getClaimsFromToken(refreshToken);
        assertNotNull(claims);
        assertEquals("hr01", claims.getSubject());
        assertEquals("refresh", claims.get("type", String.class));
    }

    @Test
    @DisplayName("从Token获取用户名 - 应该正确提取")
    void testGetUsernameFromToken() {
        // Given
        String token = jwtUtil.generateToken(testUser);

        // When
        String username = jwtUtil.getUsernameFromToken(token);

        // Then
        assertEquals("hr01", username);
    }

    @Test
    @DisplayName("从Token获取用户ID - 应该正确提取")
    void testGetUserIdFromToken() {
        // Given
        String token = jwtUtil.generateToken(testUser);

        // When
        Long userId = jwtUtil.getUserIdFromToken(token);

        // Then
        assertEquals(1L, userId);
    }

    @Test
    @DisplayName("从Token获取角色 - 应该正确提取")
    void testGetRoleFromToken() {
        // Given
        String token = jwtUtil.generateToken(testUser);

        // When
        String role = jwtUtil.getRoleFromToken(token);

        // Then
        assertEquals("HR_SPECIALIST", role);
    }

    @Test
    @DisplayName("生成Token - 系统管理员角色应被正确携带")
    void testGenerateToken_SystemAdminRole() {
        // Given
        testUser.setRole("SYSTEM_ADMIN");
        testUser.setUsername("admin");

        // When
        String token = jwtUtil.generateToken(testUser);

        // Then
        Claims claims = jwtUtil.getClaimsFromToken(token);
        assertNotNull(claims);
        assertEquals("admin", claims.getSubject());
        assertEquals("SYSTEM_ADMIN", claims.get("role", String.class));
    }

    @Test
    @DisplayName("验证Token - 有效Token应该返回true")
    void testValidateToken_ValidToken() {
        // Given
        String token = jwtUtil.generateToken(testUser);

        // When
        boolean isValid = jwtUtil.validateToken(token);

        // Then
        assertTrue(isValid);
    }

    @Test
    @DisplayName("验证Token - 无效Token应该返回false")
    void testValidateToken_InvalidToken() {
        // Given
        String invalidToken = "invalid.token.here";

        // When
        boolean isValid = jwtUtil.validateToken(invalidToken);

        // Then
        assertFalse(isValid);
    }

    @Test
    @DisplayName("验证Token - 空Token应该返回false")
    void testValidateToken_EmptyToken() {
        // When
        boolean isValid = jwtUtil.validateToken("");

        // Then
        assertFalse(isValid);
    }

    @Test
    @DisplayName("验证Token并返回消息 - 有效Token应该返回null")
    void testValidateTokenWithMessage_ValidToken() {
        // Given
        String token = jwtUtil.generateToken(testUser);

        // When
        String message = jwtUtil.validateTokenWithMessage(token);

        // Then
        assertNull(message);
    }

    @Test
    @DisplayName("验证Token并返回消息 - 空Token应该返回错误消息")
    void testValidateTokenWithMessage_EmptyToken() {
        // When
        String message = jwtUtil.validateTokenWithMessage("");

        // Then
        assertEquals("Token不能为空", message);
    }

    @Test
    @DisplayName("验证Token并返回消息 - 无效Token应该返回错误消息")
    void testValidateTokenWithMessage_InvalidToken() {
        // Given
        String invalidToken = "invalid.token.here";

        // When
        String message = jwtUtil.validateTokenWithMessage(invalidToken);

        // Then
        assertNotNull(message);
        assertTrue(message.contains("Token无效") || message.contains("Token已过期"));
    }

    @Test
    @DisplayName("验证是否为Refresh Token - Refresh Token应该返回true")
    void testIsRefreshToken_RefreshToken() {
        // Given
        String refreshToken = jwtUtil.generateRefreshToken(testUser);

        // When
        boolean isRefresh = jwtUtil.isRefreshToken(refreshToken);

        // Then
        assertTrue(isRefresh);
    }

    @Test
    @DisplayName("验证是否为Refresh Token - Access Token应该返回false")
    void testIsRefreshToken_AccessToken() {
        // Given
        String accessToken = jwtUtil.generateToken(testUser);

        // When
        boolean isRefresh = jwtUtil.isRefreshToken(accessToken);

        // Then
        assertFalse(isRefresh);
    }

    @Test
    @DisplayName("获取过期时间 - 应该返回秒数")
    void testGetExpirationTime() {
        // When
        Long expirationTime = jwtUtil.getExpirationTime();

        // Then
        assertEquals(3600L, expirationTime); // 3600000ms / 1000 = 3600s
    }

    @Test
    @DisplayName("获取Refresh Token过期时间 - 应该返回秒数")
    void testGetRefreshExpirationTime() {
        // When
        Long refreshExpirationTime = jwtUtil.getRefreshExpirationTime();

        // Then
        assertEquals(604800L, refreshExpirationTime); // 604800000ms / 1000 = 604800s
    }
}
