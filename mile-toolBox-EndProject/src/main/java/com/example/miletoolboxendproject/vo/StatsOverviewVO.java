package com.example.miletoolboxendproject.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 后台统计概览。
 */
@Data
public class StatsOverviewVO implements Serializable {

    /** 注册用户数 */
    private long userCount;

    /** 工具总数 */
    private long toolCount;

    /** 分类总数 */
    private long categoryCount;

    /** 累计使用次数 */
    private long totalUsage;

    /** 今日使用次数 */
    private long todayUsage;
}
