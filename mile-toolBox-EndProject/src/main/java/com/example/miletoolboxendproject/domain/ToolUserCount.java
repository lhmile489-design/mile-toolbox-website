package com.example.miletoolboxendproject.domain;

import lombok.Data;

/**
 * 工具「使用人数」聚合结果（COUNT(DISTINCT userId) GROUP BY toolId）。
 * <p>仅用于 distinct-user 热门排行的中间投影，非数据库表。
 */
@Data
public class ToolUserCount {

    /** 工具ID */
    private Long toolId;

    /** 去重使用人数（仅统计登录用户；游客 userId 为 NULL 被 COUNT(DISTINCT) 忽略） */
    private Long userCount;
}
