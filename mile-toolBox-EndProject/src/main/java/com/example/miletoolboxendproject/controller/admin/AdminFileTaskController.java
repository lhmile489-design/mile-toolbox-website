package com.example.miletoolboxendproject.controller.admin;

import cn.dev33.satoken.annotation.SaCheckLogin;
import com.example.miletoolboxendproject.common.PageResult;
import com.example.miletoolboxendproject.common.Result;
import com.example.miletoolboxendproject.domain.ToolFileTask;
import com.example.miletoolboxendproject.satoken.StpAdminUtil;
import com.example.miletoolboxendproject.service.AdminFileTaskService;
import com.example.miletoolboxendproject.vo.FileTaskStatsVO;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 后台文件任务监控接口（ADMIN 域）。
 * <p>展示后端文件工具（PDF/图片/文档）的处理流水：成功/失败、耗时、来源 IP、失败原因。
 */
@SaCheckLogin(type = StpAdminUtil.TYPE)
@RestController
@RequestMapping("/admin/file-task")
public class AdminFileTaskController {

    @Resource
    private AdminFileTaskService fileTaskService;

    /**
     * 分页查询文件处理任务
     *
     * @param page    页码（默认1）
     * @param size    每页大小（默认10）
     * @param toolKey 工具标识筛选（可选）
     * @param status  状态筛选 0成功 1失败（可选）
     * @param keyword 关键词（可选，匹配文件名/IP）
     */
    @GetMapping("/page")
    public Result<PageResult<ToolFileTask>> page(@RequestParam(defaultValue = "1") int page,
                                                 @RequestParam(defaultValue = "10") int size,
                                                 @RequestParam(required = false) String toolKey,
                                                 @RequestParam(required = false) Integer status,
                                                 @RequestParam(required = false) String keyword) {
        return Result.success(fileTaskService.page(page, size, toolKey, status, keyword));
    }

    /**
     * 任务详情
     *
     * @param id 任务ID
     */
    @GetMapping("/{id}")
    public Result<ToolFileTask> detail(@PathVariable Long id) {
        return Result.success(fileTaskService.detail(id));
    }

    /**
     * 监控概览（总数/成功/失败/今日）
     */
    @GetMapping("/stats")
    public Result<FileTaskStatsVO> stats() {
        return Result.success(fileTaskService.stats());
    }
}
