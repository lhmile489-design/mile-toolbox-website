package com.example.miletoolboxendproject.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.miletoolboxendproject.domain.AdminUser;
import com.example.miletoolboxendproject.dto.LoginDTO;
import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.mapper.AdminUserMapper;
import com.example.miletoolboxendproject.satoken.StpAdminUtil;
import com.example.miletoolboxendproject.service.AdminUserService;
import com.example.miletoolboxendproject.vo.AdminLoginVO;
import com.example.miletoolboxendproject.vo.AdminVO;
import jakarta.annotation.Resource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 后台管理员服务实现。
 */
@Service
public class AdminUserServiceImpl extends ServiceImpl<AdminUserMapper, AdminUser>
        implements AdminUserService {

    @Resource
    private PasswordEncoder passwordEncoder;

    @Override
    public AdminLoginVO login(LoginDTO dto) {
        QueryWrapper<AdminUser> qw = new QueryWrapper<>();
        qw.eq("username", dto.getUsername());
        AdminUser admin = this.getOne(qw);
        if (admin == null || !passwordEncoder.matches(dto.getPassword(), admin.getPassword())) {
            throw new BusinessException(ErrCode.PASSWORD_ERROR);
        }
        if (admin.getStatus() != null && admin.getStatus() == 1) {
            throw new BusinessException(ErrCode.USER_DISABLED);
        }
        // Sa-Token ADMIN 域登录（与前台用户域隔离）
        StpAdminUtil.login(admin.getId());
        String token = StpAdminUtil.stpLogic.getTokenValue();
        return new AdminLoginVO(token, AdminVO.of(admin));
    }

    @Override
    public AdminVO currentAdmin() {
        long adminId = StpAdminUtil.getLoginIdAsLong();
        AdminUser admin = this.getById(adminId);
        if (admin == null) {
            throw new BusinessException(ErrCode.USER_NOT_FOUND);
        }
        return AdminVO.of(admin);
    }
}
