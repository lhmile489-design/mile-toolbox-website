package com.example.miletoolboxendproject.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import com.example.miletoolboxendproject.common.Result;
import com.example.miletoolboxendproject.domain.ToolCategory;
import com.example.miletoolboxendproject.ratelimit.RateLimit;
import com.example.miletoolboxendproject.service.ToolService;
import com.example.miletoolboxendproject.utils.AuthUtils;
import com.example.miletoolboxendproject.vo.ToolVO;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 前台工具中心接口。工具清单由后端统一下发。
 */
@RestController
@RequestMapping("/tool")
public class ToolController {

    @Resource
    private ToolService toolService;

    /**
     * 工具分类列表
     *
     * @return 启用的分类（按 sort 升序）
     */
    @SaIgnore
    @GetMapping("/categories")
    public Result<List<ToolCategory>> categories() {
        return Result.success(toolService.listCategories());
    }

    /**
     * 工具清单下发
     *
     * @param categoryId 分类ID（可选）
     * @param keyword    关键词（可选，匹配名称/描述）
     * @return 上架工具列表（登录用户标记是否已收藏）
     */
    @SaIgnore
    @GetMapping("/list")
    public Result<List<ToolVO>> list(@RequestParam(required = false) Long categoryId,
                                     @RequestParam(required = false) String keyword) {
        Long userId = AuthUtils.currentUserIdOrNull();
        return Result.success(toolService.listTools(categoryId, keyword, userId));
    }

    /**
     * 工具详情
     *
     * @param toolKey 工具标识
     * @return 工具详情
     */
    @SaIgnore
    @GetMapping("/detail/{toolKey}")
    public Result<ToolVO> detail(@PathVariable String toolKey) {
        Long userId = AuthUtils.currentUserIdOrNull();
        return Result.success(toolService.detail(toolKey, userId));
    }

    /**
     * 热门工具（最多人使用）
     *
     * @param limit 数量上限（默认 10）
     * @param by    排行维度：{@code count}（按累计使用次数，默认）或 {@code users}（按去重使用人数）
     * @return 热门工具列表
     */
    @SaIgnore
    @GetMapping("/hot")
    public Result<List<ToolVO>> hot(@RequestParam(defaultValue = "10") int limit,
                                    @RequestParam(defaultValue = "count") String by) {
        Long userId = AuthUtils.currentUserIdOrNull();
        List<ToolVO> data = "users".equalsIgnoreCase(by)
                ? toolService.hotToolsByUsers(limit, userId)
                : toolService.hotTools(limit, userId);
        return Result.success(data);
    }

    /**
     * 上报使用（前端工具用完调用；累计次数自增 + 记录使用）
     *
     * @param toolKey 工具标识
     * @return 成功
     */
    @SaIgnore
    @RateLimit(limit = 60, window = 60)
    @PostMapping("/use/{toolKey}")
    public Result<Void> reportUse(@PathVariable String toolKey) {
        Long userId = AuthUtils.currentUserIdOrNull();
        toolService.reportUse(toolKey, userId);
        return Result.success();
    }
}
