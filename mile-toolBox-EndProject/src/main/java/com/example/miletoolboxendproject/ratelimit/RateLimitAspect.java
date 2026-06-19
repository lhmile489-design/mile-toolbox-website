package com.example.miletoolboxendproject.ratelimit;

import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * 限流切面：拦截 {@link RateLimit} 注解的方法，按「IP + 方法」固定窗口计数，超限抛 {@code 10306} 并带 Retry-After。
 */
@Aspect
@Component
public class RateLimitAspect {

    @Resource
    private RateLimiter rateLimiter;

    @Around("@annotation(rateLimit)")
    public Object around(ProceedingJoinPoint joinPoint, RateLimit rateLimit) throws Throwable {
        ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        // 拿不到请求上下文（非 Web 调用）时不限流
        if (attrs == null) {
            return joinPoint.proceed();
        }
        HttpServletRequest request = attrs.getRequest();
        String method = ((MethodSignature) joinPoint.getSignature()).getMethod().getName();
        String ip = clientIp(request);
        String key = "rate:" + method + ":" + ip;

        if (!rateLimiter.allow(key, rateLimit.limit(), rateLimit.window())) {
            HttpServletResponse response = attrs.getResponse();
            if (response != null) {
                response.setHeader("Retry-After", String.valueOf(rateLimit.window()));
            }
            throw new BusinessException(ErrCode.RATE_LIMIT);
        }
        return joinPoint.proceed();
    }

    /** 取客户端真实 IP（兼容反向代理） */
    private String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            int comma = xff.indexOf(',');
            return comma > 0 ? xff.substring(0, comma).trim() : xff.trim();
        }
        String real = request.getHeader("X-Real-IP");
        if (real != null && !real.isBlank()) {
            return real.trim();
        }
        return request.getRemoteAddr();
    }
}
