package com.example.miletoolboxendproject.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.annotation.SaIgnore;
import cn.dev33.satoken.stp.StpUtil;
import com.example.miletoolboxendproject.common.Result;
import com.example.miletoolboxendproject.dto.ChangePasswordDTO;
import com.example.miletoolboxendproject.dto.LoginDTO;
import com.example.miletoolboxendproject.dto.RegisterDTO;
import com.example.miletoolboxendproject.dto.UpdateProfileDTO;
import com.example.miletoolboxendproject.service.ToolUserService;
import com.example.miletoolboxendproject.vo.LoginVO;
import com.example.miletoolboxendproject.vo.UserVO;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

/**
 * 前台用户接口。
 */
@RestController
@RequestMapping("/user")
public class UserController {

    @Resource
    private ToolUserService userService;

    /**
     * 注册
     *
     * @param dto 注册信息（用户名/密码/昵称）
     * @return 用户信息
     */
    @SaIgnore
    @PostMapping("/register")
    public Result<UserVO> register(@RequestBody @Valid RegisterDTO dto) {
        return Result.success(userService.register(dto));
    }

    /**
     * 登录
     *
     * @param dto 登录信息（用户名/密码）
     * @return token + 用户信息
     */
    @SaIgnore
    @PostMapping("/login")
    public Result<LoginVO> login(@RequestBody @Valid LoginDTO dto) {
        return Result.success(userService.login(dto));
    }

    /**
     * 登出
     *
     * @return 成功
     */
    @SaCheckLogin
    @PostMapping("/logout")
    public Result<Void> logout() {
        StpUtil.logout();
        return Result.success();
    }

    /**
     * 当前登录用户信息
     *
     * @return 用户信息
     */
    @SaCheckLogin
    @GetMapping("/info")
    public Result<UserVO> info() {
        return Result.success(userService.currentUser());
    }

    /**
     * 修改个人资料（仅更新非空字段）
     *
     * @param dto 资料
     * @return 更新后的用户信息
     */
    @SaCheckLogin
    @PutMapping("/info")
    public Result<UserVO> updateProfile(@RequestBody UpdateProfileDTO dto) {
        if (dto == null) {
            return Result.error("400", "参数不能为空");
        }
        return Result.success(userService.updateProfile(dto));
    }

    /**
     * 修改密码
     *
     * @param dto 原密码 + 新密码
     * @return 成功
     */
    @SaCheckLogin
    @PutMapping("/password")
    public Result<Void> changePassword(@RequestBody @Valid ChangePasswordDTO dto) {
        userService.changePassword(dto);
        return Result.success();
    }
}
