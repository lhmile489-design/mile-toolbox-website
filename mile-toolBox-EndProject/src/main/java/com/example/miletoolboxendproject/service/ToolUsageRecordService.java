package com.example.miletoolboxendproject.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.miletoolboxendproject.domain.ToolUsageRecord;

import java.util.List;

/**
 * 工具使用记录服务。
 */
public interface ToolUsageRecordService extends IService<ToolUsageRecord> {

    /**
     * 新增一条使用记录（用户级历史超上限则滚动淘汰最旧）
     *
     * @param userId  用户ID（游客为空）
     * @param toolId  工具ID
     * @param toolKey 工具标识
     */
    void addRecord(Long userId, Long toolId, String toolKey);

    /**
     * 查询用户最近使用的工具ID（按使用时间倒序去重）
     *
     * @param userId 用户ID
     * @param limit  数量上限
     * @return 去重后的工具ID（保持最近优先顺序）
     */
    List<Long> listRecentToolIds(Long userId, int limit);

    /**
     * 按「去重使用人数」排序返回工具ID（仅统计登录用户）。
     *
     * @param limit 数量上限
     * @return 工具ID（按使用人数倒序）
     */
    List<Long> rankToolIdsByDistinctUser(int limit);
}
