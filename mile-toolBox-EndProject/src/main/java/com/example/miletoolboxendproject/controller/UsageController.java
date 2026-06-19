package com.example.miletoolboxendproject.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.stp.StpUtil;
import com.example.miletoolboxendproject.common.Result;
import com.example.miletoolboxendproject.service.ToolService;
import com.example.miletoolboxendproject.vo.ToolVO;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 前台最近使用接口（需登录）。
 */
@SaCheckLogin
@RestController
@RequestMapping("/usage")
public class UsageController {

    @Resource
    private ToolService toolService;

    /**
     * 最近使用工具
     *
     * @param limit 数量上限（默认 12）
     * @return 最近使用的工具（按时间倒序去重）
     */
    @GetMapping("/recent")
    public Result<List<ToolVO>> recent(@RequestParam(defaultValue = "12") int limit) {
        return Result.success(toolService.recentTools(StpUtil.getLoginIdAsLong(), limit));
    }
}
