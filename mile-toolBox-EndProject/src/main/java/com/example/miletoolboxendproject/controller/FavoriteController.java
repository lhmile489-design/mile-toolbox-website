package com.example.miletoolboxendproject.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.stp.StpUtil;
import com.example.miletoolboxendproject.common.Result;
import com.example.miletoolboxendproject.service.ToolFavoriteService;
import com.example.miletoolboxendproject.service.ToolService;
import com.example.miletoolboxendproject.vo.ToolVO;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 前台收藏接口（需登录）。
 */
@SaCheckLogin
@RestController
@RequestMapping("/favorite")
public class FavoriteController {

    @Resource
    private ToolFavoriteService favoriteService;

    @Resource
    private ToolService toolService;

    /**
     * 收藏工具
     *
     * @param toolId 工具ID
     * @return 成功
     */
    @PostMapping("/{toolId}")
    public Result<Void> favorite(@PathVariable Long toolId) {
        favoriteService.favorite(StpUtil.getLoginIdAsLong(), toolId);
        return Result.success();
    }

    /**
     * 取消收藏
     *
     * @param toolId 工具ID
     * @return 成功
     */
    @DeleteMapping("/{toolId}")
    public Result<Void> unfavorite(@PathVariable Long toolId) {
        favoriteService.unfavorite(StpUtil.getLoginIdAsLong(), toolId);
        return Result.success();
    }

    /**
     * 我的收藏列表
     *
     * @return 已收藏的工具
     */
    @GetMapping("/list")
    public Result<List<ToolVO>> list() {
        return Result.success(toolService.favoriteTools(StpUtil.getLoginIdAsLong()));
    }
}
