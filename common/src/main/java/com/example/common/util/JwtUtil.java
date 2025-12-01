package com.example.common.util;

import com.example.common.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT工具类
 * 通用工具类，所有模块都可以使用
 */
@Slf4j
@Component
public class JwtUtil {

    @Value("${jwt.secret:myHRSystemSecretKeyForJWTTokenGeneration2024}")
    private String secret;

    @Value("${jwt.expiration:3600000}") // 默认1小时（毫秒）
    private Long expiration;

    @Value("${jwt.refresh-expiration:604800000}") // 默认7天（毫秒）
    private Long refreshExpiration;

    /**
     * 获取密钥
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 生成Access Token
     *
     * @param user 用户信息
     * @return Token字符串
     */
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("username", user.getUsername());
        claims.put("role", user.getRole());
        claims.put("type", "access");
        return createToken(claims, user.getUsername(), expiration);
    }

    /**
     * 生成Refresh Token
     *
     * @param user 用户信息
     * @return Refresh Token字符串
     */
    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("username", user.getUsername());
        claims.put("role", user.getRole());
        claims.put("type", "refresh");
        return createToken(claims, user.getUsername(), refreshExpiration);
    }

    /**
     * 创建Token
     */
    private String createToken(Map<String, Object> claims, String subject, Long expirationTime) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * 从Token中获取Claims
     */
    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * 从Token中获取用户名
     */
    public String getUsernameFromToken(String token) {
        return getClaimsFromToken(token).getSubject();
    }

    /**
     * 从Token中获取用户ID
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("userId", Long.class);
    }

    /**
     * 从Token中获取角色
     */
    public String getRoleFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("role", String.class);
    }

    /**
     * 验证Token是否有效
     */
    public boolean validateToken(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            log.error("Token验证失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 验证是否为Refresh Token
     */
    public boolean isRefreshToken(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            String type = claims.get("type", String.class);
            return "refresh".equals(type);
        } catch (Exception e) {
            log.error("Token类型验证失败: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 获取Access Token过期时间（秒）
     */
    public Long getExpirationTime() {
        return expiration / 1000; // 转换为秒
    }

    /**
     * 获取Refresh Token过期时间（秒）
     */
    public Long getRefreshExpirationTime() {
        return refreshExpiration / 1000; // 转换为秒
    }
}

