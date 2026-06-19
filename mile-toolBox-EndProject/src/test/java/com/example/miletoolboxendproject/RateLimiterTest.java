package com.example.miletoolboxendproject;

import com.example.miletoolboxendproject.ratelimit.RateLimiter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * RateLimiter 单测：窗口内放行、超限拦截、首次计数设过期、Redis 异常降级放行。
 */
class RateLimiterTest {

    private RateLimiter limiter;
    private StringRedisTemplate redis;
    private ValueOperations<String, String> valueOps;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        limiter = new RateLimiter();
        redis = mock(StringRedisTemplate.class);
        valueOps = mock(ValueOperations.class);
        when(redis.opsForValue()).thenReturn(valueOps);
        ReflectionTestUtils.setField(limiter, "stringRedisTemplate", redis);
    }

    @Test
    void allow_underLimit_returnsTrue() {
        when(valueOps.increment("k")).thenReturn(5L);
        assertTrue(limiter.allow("k", 10, 60));
    }

    @Test
    void allow_overLimit_returnsFalse() {
        when(valueOps.increment("k")).thenReturn(11L);
        assertFalse(limiter.allow("k", 10, 60));
    }

    @Test
    void allow_firstHit_setsExpire() {
        when(valueOps.increment("k")).thenReturn(1L);
        assertTrue(limiter.allow("k", 10, 60));
        verify(redis).expire(anyString(), any());
    }

    @Test
    void allow_redisError_degradesToAllow() {
        when(valueOps.increment("k")).thenThrow(new RuntimeException("redis down"));
        assertTrue(limiter.allow("k", 10, 60), "Redis 异常应降级放行");
    }
}
