package com.example.miletoolboxendproject.config;

import com.example.miletoolboxendproject.domain.AdminUser;
import com.example.miletoolboxendproject.service.AdminUserService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 默认管理员初始化。启动时若无任何管理员，幂等创建默认账号。
 * <p>默认账号：admin / admin123456（首次登录后请尽快修改密码）。
 */
@Slf4j
@Component
public class AdminInitializer implements CommandLineRunner {

    @Resource
    private AdminUserService adminUserService;

    @Resource
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (adminUserService.count() > 0) {
            return;
        }
        AdminUser admin = new AdminUser();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123456"));
        admin.setNickname("超级管理员");
        admin.setStatus(0);
        adminUserService.save(admin);
        log.info("已创建默认管理员账号：admin / admin123456（请尽快修改密码）");
    }
}
