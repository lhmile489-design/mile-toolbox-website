package com.example.miletoolboxendproject.controller.admin;

import cn.dev33.satoken.annotation.SaCheckLogin;
import com.example.miletoolboxendproject.common.Result;
import com.example.miletoolboxendproject.domain.Tool;
import com.example.miletoolboxendproject.satoken.StpAdminUtil;
import com.example.miletoolboxendproject.service.AdminStatsService;
import com.example.miletoolboxendproject.vo.StatsOverviewVO;
import com.example.miletoolboxendproject.vo.TrendPointVO;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 后台统计接口（ADMIN 域）。
 */
@SaCheckLogin(type = StpAdminUtil.TYPE)
@RestController
@RequestMapping("/admin/stats")
public class AdminStatsController {

    @Resource
    private AdminStatsService statsService;

    /**
     * 概览统计
     */
    @GetMapping("/overview")
    public Result<StatsOverviewVO> overview() {
        return Result.success(statsService.overview());
    }

    /**
     * 热门工具（按累计使用次数倒序）
     *
     * @param limit 数量（默认10）
     */
    @GetMapping("/hot-tools")
    public Result<List<Tool>> hotTools(@RequestParam(defaultValue = "10") int limit) {
        return Result.success(statsService.hotTools(limit));
    }

    /**
     * 热门工具（按「去重使用人数」倒序，仅统计登录用户）
     *
     * @param limit 数量（默认10）
     */
    @GetMapping("/hot-tools-by-users")
    public Result<List<Tool>> hotToolsByUsers(@RequestParam(defaultValue = "10") int limit) {
        return Result.success(statsService.hotToolsByUsers(limit));
    }

    /**
     * 使用趋势（近 N 天）
     *
     * @param days 天数（默认7）
     */
    @GetMapping("/usage-trend")
    public Result<List<TrendPointVO>> usageTrend(@RequestParam(defaultValue = "7") int days) {
        return Result.success(statsService.usageTrend(days));
    }
}
