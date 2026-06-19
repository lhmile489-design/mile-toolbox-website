package com.example.miletoolboxendproject.controller.admin;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.annotation.SaIgnore;
import com.example.miletoolboxendproject.common.Result;
import com.example.miletoolboxendproject.dto.LoginDTO;
import com.example.miletoolboxendproject.satoken.StpAdminUtil;
import com.example.miletoolboxendproject.service.AdminUserService;
import com.example.miletoolboxendproject.vo.AdminLoginVO;
import com.example.miletoolboxendproject.vo.AdminVO;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 后台管理员认证接口（ADMIN 域）。
 */
@RestController
@RequestMapping("/admin/auth")
public class AdminAuthController {

    @Resource
    private AdminUserService adminUserService;

    /**
     * 管理员登录
     *
     * @param dto 用户名 + 密码
     * @return token + 管理员信息
     */
    @SaIgnore
    @PostMapping("/login")
    public Result<AdminLoginVO> login(@RequestBody @Valid LoginDTO dto) {
        return Result.success(adminUserService.login(dto));
    }

    /**
     * 管理员登出
     */
    @SaCheckLogin(type = StpAdminUtil.TYPE)
    @PostMapping("/logout")
    public Result<Void> logout() {
        StpAdminUtil.logout();
        return Result.success();
    }

    /**
     * 当前管理员信息
     */
    @SaCheckLogin(type = StpAdminUtil.TYPE)
    @GetMapping("/info")
    public Result<AdminVO> info() {
        return Result.success(adminUserService.currentAdmin());
    }
}
