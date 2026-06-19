package com.example.miletoolboxendproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.miletoolboxendproject.domain.Tool;
import com.example.miletoolboxendproject.domain.ToolCategory;
import com.example.miletoolboxendproject.vo.ToolVO;

import java.util.List;

/**
 * 工具服务。工具清单后端下发的单一事实来源。
 */
public interface ToolService extends IService<Tool> {

    /**
     * 工具分类列表（启用的，按 sort 升序）
     */
    List<ToolCategory> listCategories();

    /**
     * 工具清单下发（上架工具，可按分类/关键词过滤；登录用户标记是否已收藏）
     *
     * @param categoryId 分类ID（可空）
     * @param keyword    关键词（可空，匹配名称/描述）
     * @param userId     当前用户ID（可空，用于 favorited 标记）
     */
    List<ToolVO> listTools(Long categoryId, String keyword, Long userId);

    /**
     * 工具详情
     *
     * @param toolKey 工具标识
     * @param userId  当前用户ID（可空）
     */
    ToolVO detail(String toolKey, Long userId);

    /**
     * 热门工具（按累计使用次数倒序）
     *
     * @param limit  数量上限
     * @param userId 当前用户ID（可空）
     */
    List<ToolVO> hotTools(int limit, Long userId);

    /**
     * 热门工具（按「去重使用人数」倒序，仅统计登录用户）。
     * <p>与 {@link #hotTools} 的区别：后者按总次数，本方法按多少不同用户用过。
     *
     * @param limit  数量上限
     * @param userId 当前用户ID（可空，用于 favorited 标记）
     */
    List<ToolVO> hotToolsByUsers(int limit, Long userId);

    /**
     * 最近使用工具
     *
     * @param userId 用户ID
     * @param limit  数量上限
     */
    List<ToolVO> recentTools(Long userId, int limit);

    /**
     * 我的收藏工具
     *
     * @param userId 用户ID
     */
    List<ToolVO> favoriteTools(Long userId);

    /**
     * 上报使用：累计次数原子自增 + 记录使用
     *
     * @param toolKey 工具标识
     * @param userId  当前用户ID（可空，游客也统计但不入个人历史）
     */
    void reportUse(String toolKey, Long userId);

    // ===== 后台管理 =====

    /**
     * 后台分页查询工具（含上下架，按 sort 升序）
     *
     * @param page       页码（从 1 开始）
     * @param size       每页大小
     * @param categoryId 分类ID（可空）
     * @param keyword    关键词（可空，匹配名称/标识/描述）
     */
    com.example.miletoolboxendproject.common.PageResult<Tool> adminPage(
            int page, int size, Long categoryId, String keyword);

    /**
     * 后台新增工具（toolKey 唯一校验）
     *
     * @param tool 工具
     * @return 新增后的工具
     */
    Tool adminCreate(Tool tool);

    /**
     * 后台更新工具
     *
     * @param tool 工具（需含 id）
     * @return 更新后的工具
     */
    Tool adminUpdate(Tool tool);

    /**
     * 后台上下架
     *
     * @param id     工具ID
     * @param status 0上架 1下架
     */
    void adminChangeStatus(Long id, Integer status);

    /**
     * 后台删除工具
     *
     * @param id 工具ID
     */
    void adminDelete(Long id);
}
