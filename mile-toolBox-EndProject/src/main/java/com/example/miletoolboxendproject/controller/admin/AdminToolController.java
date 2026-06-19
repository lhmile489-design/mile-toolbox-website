package com.example.miletoolboxendproject.controller.admin;

import cn.dev33.satoken.annotation.SaCheckLogin;
import com.example.miletoolboxendproject.common.PageResult;
import com.example.miletoolboxendproject.common.Result;
import com.example.miletoolboxendproject.domain.Tool;
import com.example.miletoolboxendproject.satoken.StpAdminUtil;
import com.example.miletoolboxendproject.service.ToolService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

/**
 * 后台工具管理接口（ADMIN 域）。
 */
@SaCheckLogin(type = StpAdminUtil.TYPE)
@RestController
@RequestMapping("/admin/tool")
public class AdminToolController {

    @Resource
    private ToolService toolService;

    /**
     * 分页查询工具
     *
     * @param page       页码（默认1）
     * @param size       每页大小（默认10）
     * @param categoryId 分类ID（可选）
     * @param keyword    关键词（可选）
     */
    @GetMapping("/page")
    public Result<PageResult<Tool>> page(@RequestParam(defaultValue = "1") int page,
                                         @RequestParam(defaultValue = "10") int size,
                                         @RequestParam(required = false) Long categoryId,
                                         @RequestParam(required = false) String keyword) {
        return Result.success(toolService.adminPage(page, size, categoryId, keyword));
    }

    /**
     * 新增工具
     *
     * @param tool 工具
     */
    @PostMapping
    public Result<Tool> create(@RequestBody Tool tool) {
        if (tool == null) {
            return Result.error("400", "参数不能为空");
        }
        return Result.success(toolService.adminCreate(tool));
    }

    /**
     * 更新工具
     *
     * @param tool 工具（含 id）
     */
    @PutMapping
    public Result<Tool> update(@RequestBody Tool tool) {
        if (tool == null) {
            return Result.error("400", "参数不能为空");
        }
        return Result.success(toolService.adminUpdate(tool));
    }

    /**
     * 上下架
     *
     * @param id     工具ID
     * @param status 0上架 1下架
     */
    @PutMapping("/{id}/status")
    public Result<Void> changeStatus(@PathVariable Long id, @RequestParam Integer status) {
        toolService.adminChangeStatus(id, status);
        return Result.success();
    }

    /**
     * 删除工具
     *
     * @param id 工具ID
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        toolService.adminDelete(id);
        return Result.success();
    }
}
