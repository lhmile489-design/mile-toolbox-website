package com.example.miletoolboxendproject.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.miletoolboxendproject.domain.ToolUsageRecord;
import com.example.miletoolboxendproject.domain.ToolUserCount;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 工具使用记录 Mapper。
 */
@Mapper
public interface ToolUsageRecordMapper extends BaseMapper<ToolUsageRecord> {

    /**
     * 按「去重使用人数」统计工具排行（仅统计登录用户：userId 非空）。
     * <p>语义：每个工具有多少个不同的登录用户用过。游客 {@code userId} 为 NULL，
     * {@code COUNT(DISTINCT userId)} 天然忽略，故不计入人数。
     * <p>列名为驼峰（项目 map-underscore 关闭），别名直接映射 {@link ToolUserCount} 字段。
     *
     * @param limit 返回条数上限
     * @return 按 userCount 倒序的 (toolId, userCount) 列表
     */
    @Select("SELECT toolId AS toolId, COUNT(DISTINCT userId) AS userCount "
            + "FROM tool_usage_record "
            + "WHERE userId IS NOT NULL AND toolId IS NOT NULL "
            + "GROUP BY toolId "
            + "ORDER BY userCount DESC "
            + "LIMIT #{limit}")
    List<ToolUserCount> rankByDistinctUser(@Param("limit") int limit);
}
