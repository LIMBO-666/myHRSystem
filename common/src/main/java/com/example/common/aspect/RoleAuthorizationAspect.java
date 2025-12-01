package com.example.common.aspect;

import com.example.common.annotation.RequireRole;
import com.example.common.util.JwtUtil;
import com.example.common.exception.AuthenticationException;
import com.example.common.exception.AuthorizationException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;

/**
 * 角色权限切面
 * 用于拦截带有@RequireRole注解的方法，验证用户角色
 * 通用切面，所有模块都可以使用
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class RoleAuthorizationAspect {

    private final JwtUtil jwtUtil;

    @Before("@annotation(requireRole)")
    public void checkRole(RequireRole requireRole) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            throw new AuthenticationException("无法获取请求信息");
        }

        HttpServletRequest request = attributes.getRequest();
        String token = getTokenFromRequest(request);

        if (token == null || !jwtUtil.validateToken(token)) {
            throw new AuthenticationException("Token无效或已过期");
        }

        // 获取用户角色
        String userRole = jwtUtil.getRoleFromToken(token);
        String[] requiredRoles = requireRole.value();

        // 检查用户角色是否在允许的角色列表中
        boolean hasPermission = Arrays.asList(requiredRoles).contains(userRole);

        if (!hasPermission) {
            throw new AuthorizationException("权限不足，需要角色: " + Arrays.toString(requiredRoles));
        }
    }

    /**
     * 从请求中获取Token
     */
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

