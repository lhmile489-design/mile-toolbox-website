package com.example.miletoolboxendproject.ratelimit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 接口限流注解。按「客户端IP + 方法」在时间窗内计数，超限返回 10306。
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {

    /** 时间窗内允许的最大请求数 */
    int limit() default 30;

    /** 时间窗（秒） */
    int window() default 60;
}
