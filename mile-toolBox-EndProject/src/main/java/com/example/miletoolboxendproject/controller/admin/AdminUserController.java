package com.example.miletoolboxendproject.controller.admin;

import cn.dev33.satoken.annotation.SaCheckLogin;
import com.example.miletoolboxendproject.common.PageResult;
import com.example.miletoolboxendproject.common.Result;
import com.example.miletoolboxendproject.satoken.StpAdminUtil;
import com.example.miletoolboxendproject.service.ToolUserService;
import com.example.miletoolboxendproject.vo.UserVO;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

/**
 * 后台用户管理接口（ADMIN 域）。
 */
@SaCheckLogin(type = StpAdminUtil.TYPE)
@RestController
@RequestMapping("/admin/user")
public class AdminUserController {

    @Resource
    private ToolUserService userService;

    /**
     * 分页查询前台用户
     *
     * @param page    页码（默认1）
     * @param size    每页大小（默认10）
     * @param keyword 关键词（可选，匹配用户名/昵称）
     */
    @GetMapping("/page")
    public Result<PageResult<UserVO>> page(@RequestParam(defaultValue = "1") int page,
                                           @RequestParam(defaultValue = "10") int size,
                                           @RequestParam(required = false) String keyword) {
        return Result.success(userService.adminPage(page, size, keyword));
    }

    /**
     * 启用/禁用用户
     *
     * @param id     用户ID
     * @param status 0正常 1禁用
     */
    @PutMapping("/{id}/status")
    public Result<Void> changeStatus(@PathVariable Long id, @RequestParam Integer status) {
        userService.adminChangeStatus(id, status);
        return Result.success();
    }
}
