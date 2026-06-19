package com.example.miletoolboxendproject.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 通用 Bean 配置。
 */
@Configuration
public class BeanConfig {

    /**
     * 密码编码器（BCrypt）。注册/改密用 encode，登录用 matches。
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
