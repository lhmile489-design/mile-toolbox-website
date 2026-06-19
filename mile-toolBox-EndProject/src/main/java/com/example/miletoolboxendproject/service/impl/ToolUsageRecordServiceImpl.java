package com.example.miletoolboxendproject.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.miletoolboxendproject.config.ToolboxProperties;
import com.example.miletoolboxendproject.domain.ToolUsageRecord;
import com.example.miletoolboxendproject.domain.ToolUserCount;
import com.example.miletoolboxendproject.mapper.ToolUsageRecordMapper;
import com.example.miletoolboxendproject.service.ToolUsageRecordService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;

/**
 * 工具使用记录服务实现。
 */
@Service
public class ToolUsageRecordServiceImpl extends ServiceImpl<ToolUsageRecordMapper, ToolUsageRecord>
        implements ToolUsageRecordService {

    @Resource
    private ToolboxProperties toolboxProperties;

    @Override
    public void addRecord(Long userId, Long toolId, String toolKey) {
        ToolUsageRecord record = new ToolUsageRecord();
        record.setUserId(userId);
        record.setToolId(toolId);
        record.setToolKey(toolKey);
        this.save(record);

        // 登录用户：历史超上限滚动淘汰最旧
        if (userId != null) {
            trimUserHistory(userId);
        }
    }

    /**
     * 用户历史滚动淘汰：超过上限时按时间升序删除最旧的多余记录
     */
    private void trimUserHistory(Long userId) {
        int limit = toolboxProperties.getUsageRecordLimit();
        QueryWrapper<ToolUsageRecord> countQw = new QueryWrapper<>();
        countQw.eq("userId", userId);
        long total = this.count(countQw);
        if (total <= limit) {
            return;
        }
        long toDelete = total - limit;
        QueryWrapper<ToolUsageRecord> oldestQw = new QueryWrapper<>();
        oldestQw.eq("userId", userId)
                .select("id")
                .orderByAsc("createTime")
                .last("limit " + toDelete);
        List<Long> ids = this.list(oldestQw).stream().map(ToolUsageRecord::getId).toList();
        if (!ids.isEmpty()) {
            this.removeByIds(ids);
        }
    }

    @Override
    public List<Long> listRecentToolIds(Long userId, int limit) {
        if (userId == null) {
            return Collections.emptyList();
        }
        // 拉取较多近期记录，在内存去重保序后截断（同一工具多次使用只保留最近一次）
        QueryWrapper<ToolUsageRecord> qw = new QueryWrapper<>();
        qw.eq("userId", userId)
                .isNotNull("toolId")
                .orderByDesc("createTime")
                .last("limit 200");
        List<ToolUsageRecord> records = this.list(qw);
        LinkedHashSet<Long> distinct = new LinkedHashSet<>();
        for (ToolUsageRecord r : records) {
            distinct.add(r.getToolId());
            if (distinct.size() >= limit) {
                break;
            }
        }
        return new ArrayList<>(distinct);
    }

    @Override
    public List<Long> rankToolIdsByDistinctUser(int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        return this.baseMapper.rankByDistinctUser(safeLimit).stream()
                .map(ToolUserCount::getToolId)
                .toList();
    }
}
