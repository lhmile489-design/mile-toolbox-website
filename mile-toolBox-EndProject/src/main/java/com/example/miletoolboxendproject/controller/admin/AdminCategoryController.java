package com.example.miletoolboxendproject.controller.admin;

import cn.dev33.satoken.annotation.SaCheckLogin;
import com.example.miletoolboxendproject.common.Result;
import com.example.miletoolboxendproject.domain.ToolCategory;
import com.example.miletoolboxendproject.satoken.StpAdminUtil;
import com.example.miletoolboxendproject.service.ToolCategoryService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 后台分类管理接口（ADMIN 域）。
 */
@SaCheckLogin(type = StpAdminUtil.TYPE)
@RestController
@RequestMapping("/admin/category")
public class AdminCategoryController {

    @Resource
    private ToolCategoryService categoryService;

    /**
     * 分类列表（含停用）
     */
    @GetMapping("/list")
    public Result<List<ToolCategory>> list() {
        return Result.success(categoryService.adminList());
    }

    /**
     * 新增分类
     */
    @PostMapping
    public Result<ToolCategory> create(@RequestBody ToolCategory category) {
        if (category == null) {
            return Result.error("400", "参数不能为空");
        }
        return Result.success(categoryService.adminCreate(category));
    }

    /**
     * 更新分类
     */
    @PutMapping
    public Result<ToolCategory> update(@RequestBody ToolCategory category) {
        if (category == null) {
            return Result.error("400", "参数不能为空");
        }
        return Result.success(categoryService.adminUpdate(category));
    }

    /**
     * 删除分类
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.adminDelete(id);
        return Result.success();
    }
}
