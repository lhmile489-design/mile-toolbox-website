package com.example.miletoolboxendproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.miletoolboxendproject.domain.AdminUser;
import com.example.miletoolboxendproject.dto.LoginDTO;
import com.example.miletoolboxendproject.vo.AdminLoginVO;
import com.example.miletoolboxendproject.vo.AdminVO;

/**
 * 后台管理员服务。
 */
public interface AdminUserService extends IService<AdminUser> {

    /**
     * 管理员登录（ADMIN 域）
     *
     * @param dto 用户名 + 密码
     * @return token + 管理员信息
     */
    AdminLoginVO login(LoginDTO dto);

    /**
     * 当前登录管理员信息
     */
    AdminVO currentAdmin();
}
