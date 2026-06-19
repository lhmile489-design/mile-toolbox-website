package com.example.miletoolboxendproject.ratelimit;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * 基于 Redis 的固定窗口计数限流器。
 * <p>Redis 异常时**降级放行**（限流不可用不应导致功能不可用，见 springboot-mysql-backend §13.7）。
 */
@Slf4j
@Component
public class RateLimiter {

    @Resource
    private StringRedisTemplate stringRedisTemplate;

    /**
     * 尝试获取一次配额。
     *
     * @param key           限流键
     * @param limit         窗口内最大次数
     * @param windowSeconds 窗口秒数
     * @return true 放行；false 超限
     */
    public boolean allow(String key, int limit, int windowSeconds) {
        try {
            Long count = stringRedisTemplate.opsForValue().increment(key);
            if (count == null) {
                return true;
            }
            if (count == 1L) {
                // 首次计数设置过期，形成固定窗口
                stringRedisTemplate.expire(key, Duration.ofSeconds(windowSeconds));
            }
            return count <= limit;
        } catch (Exception e) {
            log.warn("限流器 Redis 异常，降级放行: {}", e.getMessage());
            return true;
        }
    }
}
