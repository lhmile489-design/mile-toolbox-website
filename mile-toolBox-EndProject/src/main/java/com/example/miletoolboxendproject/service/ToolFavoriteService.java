package com.example.miletoolboxendproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.miletoolboxendproject.domain.ToolFavorite;

import java.util.List;

/**
 * 用户收藏服务。
 */
public interface ToolFavoriteService extends IService<ToolFavorite> {

    /**
     * 收藏工具
     *
     * @param userId 用户ID
     * @param toolId 工具ID
     */
    void favorite(Long userId, Long toolId);

    /**
     * 取消收藏
     *
     * @param userId 用户ID
     * @param toolId 工具ID
     */
    void unfavorite(Long userId, Long toolId);

    /**
     * 查询用户收藏的工具ID列表（供工具清单标记 favorited，避免 N+1）
     *
     * @param userId 用户ID（为空返回空列表）
     * @return 已收藏的工具ID
     */
    List<Long> listFavoriteToolIds(Long userId);
}
