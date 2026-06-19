package com.example.miletoolboxendproject.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.miletoolboxendproject.domain.ToolUser;
import com.example.miletoolboxendproject.dto.ChangePasswordDTO;
import com.example.miletoolboxendproject.dto.LoginDTO;
import com.example.miletoolboxendproject.dto.RegisterDTO;
import com.example.miletoolboxendproject.dto.UpdateProfileDTO;
import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.mapper.ToolUserMapper;
import com.example.miletoolboxendproject.service.ToolUserService;
import com.example.miletoolboxendproject.vo.LoginVO;
import com.example.miletoolboxendproject.vo.UserVO;
import jakarta.annotation.Resource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 前台用户服务实现。
 */
@Service
public class ToolUserServiceImpl extends ServiceImpl<ToolUserMapper, ToolUser>
        implements ToolUserService {

    @Resource
    private PasswordEncoder passwordEncoder;

    @Override
    public UserVO register(RegisterDTO dto) {
        // 用户名唯一校验
        QueryWrapper<ToolUser> qw = new QueryWrapper<>();
        qw.eq("username", dto.getUsername());
        if (this.count(qw) > 0) {
            throw new BusinessException(ErrCode.USERNAME_EXISTS);
        }
        ToolUser user = new ToolUser();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));   // BCrypt
        user.setNickname((dto.getNickname() == null || dto.getNickname().isBlank())
                ? dto.getUsername() : dto.getNickname());
        user.setStatus(0);
        this.save(user);
        return UserVO.of(user);
    }

    @Override
    public LoginVO login(LoginDTO dto) {
        QueryWrapper<ToolUser> qw = new QueryWrapper<>();
        qw.eq("username", dto.getUsername());
        ToolUser user = this.getOne(qw);
        // 用户不存在或密码错误，统一返回"用户名或密码错误"，不泄露存在性
        if (user == null || !passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrCode.PASSWORD_ERROR);
        }
        if (user.getStatus() != null && user.getStatus() == 1) {
            throw new BusinessException(ErrCode.USER_DISABLED);
        }
        // Sa-Token 默认域（前台用户）登录
        StpUtil.login(user.getId());
        String token = StpUtil.getTokenValue();
        return new LoginVO(token, UserVO.of(user));
    }

    @Override
    public UserVO currentUser() {
        long userId = StpUtil.getLoginIdAsLong();
        ToolUser user = this.getById(userId);
        if (user == null) {
            throw new BusinessException(ErrCode.USER_NOT_FOUND);
        }
        return UserVO.of(user);
    }

    @Override
    public UserVO updateProfile(UpdateProfileDTO dto) {
        long userId = StpUtil.getLoginIdAsLong();
        // 仅更新非空字段：new 一个只 set 变更字段 + id 的实体，避免覆盖未传字段为 null
        ToolUser update = new ToolUser();
        update.setId(userId);
        if (dto.getNickname() != null) update.setNickname(dto.getNickname());
        if (dto.getAvatar() != null) update.setAvatar(dto.getAvatar());
        if (dto.getEmail() != null) update.setEmail(dto.getEmail());
        if (dto.getPhone() != null) update.setPhone(dto.getPhone());
        this.updateById(update);
        return UserVO.of(this.getById(userId));
    }

    @Override
    public void changePassword(ChangePasswordDTO dto) {
        long userId = StpUtil.getLoginIdAsLong();
        ToolUser user = this.getById(userId);
        if (user == null) {
            throw new BusinessException(ErrCode.USER_NOT_FOUND);
        }
        if (!passwordEncoder.matches(dto.getOldPassword(), user.getPassword())) {
            throw new BusinessException(ErrCode.OLD_PASSWORD_ERROR);
        }
        ToolUser update = new ToolUser();
        update.setId(userId);
        update.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        this.updateById(update);
    }

    // ===== 后台管理 =====

    @Override
    public com.example.miletoolboxendproject.common.PageResult<com.example.miletoolboxendproject.vo.UserVO> adminPage(
            int page, int size, String keyword) {
        QueryWrapper<ToolUser> qw = new QueryWrapper<>();
        if (keyword != null && !keyword.isBlank()) {
            qw.and(w -> w.like("username", keyword).or().like("nickname", keyword));
        }
        qw.orderByDesc("createTime");
        com.baomidou.mybatisplus.extension.plugins.pagination.Page<ToolUser> p =
                this.page(new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(page, size), qw);
        com.example.miletoolboxendproject.common.PageResult<com.example.miletoolboxendproject.vo.UserVO> result =
                new com.example.miletoolboxendproject.common.PageResult<>();
        result.setTotal(p.getTotal());
        result.setPage(p.getCurrent());
        result.setSize(p.getSize());
        result.setList(p.getRecords().stream()
                .map(com.example.miletoolboxendproject.vo.UserVO::of)
                .toList());
        return result;
    }

    @Override
    public void adminChangeStatus(Long id, Integer status) {
        if (id == null || status == null) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "参数不能为空");
        }
        if (this.getById(id) == null) {
            throw new BusinessException(ErrCode.USER_NOT_FOUND);
        }
        ToolUser update = new ToolUser();
        update.setId(id);
        update.setStatus(status);
        this.updateById(update);
    }
}
