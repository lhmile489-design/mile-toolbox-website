package com.example.miletoolboxendproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.miletoolboxendproject.domain.ToolUser;
import com.example.miletoolboxendproject.dto.ChangePasswordDTO;
import com.example.miletoolboxendproject.dto.LoginDTO;
import com.example.miletoolboxendproject.dto.RegisterDTO;
import com.example.miletoolboxendproject.dto.UpdateProfileDTO;
import com.example.miletoolboxendproject.vo.LoginVO;
import com.example.miletoolboxendproject.vo.UserVO;

/**
 * 前台用户服务。
 */
public interface ToolUserService extends IService<ToolUser> {

    /**
     * 注册
     *
     * @param dto 注册信息
     * @return 用户信息
     */
    UserVO register(RegisterDTO dto);

    /**
     * 登录
     *
     * @param dto 登录信息
     * @return token + 用户信息
     */
    LoginVO login(LoginDTO dto);

    /**
     * 获取当前登录用户信息
     *
     * @return 用户信息
     */
    UserVO currentUser();

    /**
     * 修改当前用户资料（仅更新非空字段）
     *
     * @param dto 资料
     * @return 更新后的用户信息
     */
    UserVO updateProfile(UpdateProfileDTO dto);

    /**
     * 修改当前用户密码
     *
     * @param dto 原密码 + 新密码
     */
    void changePassword(ChangePasswordDTO dto);

    // ===== 后台管理 =====

    /**
     * 后台分页查询用户（不含密码）
     *
     * @param page    页码（从 1 开始）
     * @param size    每页大小
     * @param keyword 关键词（可空，匹配用户名/昵称）
     */
    com.example.miletoolboxendproject.common.PageResult<UserVO> adminPage(int page, int size, String keyword);

    /**
     * 后台启用/禁用用户
     *
     * @param id     用户ID
     * @param status 0正常 1禁用
     */
    void adminChangeStatus(Long id, Integer status);
}
