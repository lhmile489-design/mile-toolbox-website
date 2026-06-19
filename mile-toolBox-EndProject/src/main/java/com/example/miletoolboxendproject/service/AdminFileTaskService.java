package com.example.miletoolboxendproject.service;

import com.example.miletoolboxendproject.common.PageResult;
import com.example.miletoolboxendproject.domain.ToolFileTask;
import com.example.miletoolboxendproject.vo.FileTaskStatsVO;

/**
 * 后台文件任务监控服务（ADMIN 域）。
 */
public interface AdminFileTaskService {

    /**
     * 分页查询文件处理任务。
     *
     * @param page    页码（从1开始）
     * @param size    每页大小
     * @param toolKey 工具标识筛选（可选）
     * @param status  状态筛选 0成功 1失败（可选）
     * @param keyword 关键词（可选，匹配文件名/IP）
     */
    PageResult<ToolFileTask> page(int page, int size, String toolKey, Integer status, String keyword);

    /**
     * 任务详情。
     */
    ToolFileTask detail(Long id);

    /**
     * 监控概览（总数/成功/失败/今日）。
     */
    FileTaskStatsVO stats();
}
