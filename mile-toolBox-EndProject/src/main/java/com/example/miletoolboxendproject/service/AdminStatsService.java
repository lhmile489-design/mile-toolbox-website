package com.example.miletoolboxendproject.service;

import com.example.miletoolboxendproject.domain.Tool;
import com.example.miletoolboxendproject.vo.StatsOverviewVO;
import com.example.miletoolboxendproject.vo.TrendPointVO;

import java.util.List;

/**
 * 后台统计服务。
 */
public interface AdminStatsService {

    /**
     * 概览：用户数 / 工具数 / 分类数 / 累计使用 / 今日使用
     */
    StatsOverviewVO overview();

    /**
     * 热门工具（按累计使用次数倒序）
     *
     * @param limit 数量上限
     */
    List<Tool> hotTools(int limit);

    /**
     * 热门工具（按「去重使用人数」倒序，仅统计登录用户）
     *
     * @param limit 数量上限
     */
    List<Tool> hotToolsByUsers(int limit);

    /**
     * 使用趋势（近 N 天，按日补 0）
     *
     * @param days 天数（1-90）
     */
    List<TrendPointVO> usageTrend(int days);
}
