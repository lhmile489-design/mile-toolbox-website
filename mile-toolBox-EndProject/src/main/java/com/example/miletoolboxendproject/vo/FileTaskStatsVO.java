package com.example.miletoolboxendproject.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 文件任务监控概览。
 */
@Data
public class FileTaskStatsVO implements Serializable {

    /** 任务总数 */
    private long total;

    /** 成功数 */
    private long successCount;

    /** 失败数 */
    private long failCount;

    /** 今日任务数 */
    private long todayCount;
}
