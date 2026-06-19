package com.example.miletoolboxendproject.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.miletoolboxendproject.domain.Tool;
import com.example.miletoolboxendproject.domain.ToolUsageRecord;
import com.example.miletoolboxendproject.service.AdminStatsService;
import com.example.miletoolboxendproject.service.ToolCategoryService;
import com.example.miletoolboxendproject.service.ToolService;
import com.example.miletoolboxendproject.service.ToolUsageRecordService;
import com.example.miletoolboxendproject.service.ToolUserService;
import com.example.miletoolboxendproject.vo.StatsOverviewVO;
import com.example.miletoolboxendproject.vo.TrendPointVO;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 后台统计服务实现。
 * <p>使用趋势采用"拉取区间明细 + 内存按日聚合"的方式（工具箱初期使用量小，足够；
 * 量大后可改为 SQL group by date 聚合）。
 */
@Service
public class AdminStatsServiceImpl implements AdminStatsService {

    private static final DateTimeFormatter DAY_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Resource
    private ToolUserService userService;

    @Resource
    private ToolService toolService;

    @Resource
    private ToolCategoryService categoryService;

    @Resource
    private ToolUsageRecordService usageRecordService;

    @Override
    public StatsOverviewVO overview() {
        StatsOverviewVO vo = new StatsOverviewVO();
        vo.setUserCount(userService.count());
        vo.setToolCount(toolService.count());
        vo.setCategoryCount(categoryService.count());
        vo.setTotalUsage(usageRecordService.count());

        // 今日使用次数：createTime >= 今日 00:00
        Date todayStart = Date.from(LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant());
        QueryWrapper<ToolUsageRecord> todayQw = new QueryWrapper<>();
        todayQw.ge("createTime", todayStart);
        vo.setTodayUsage(usageRecordService.count(todayQw));
        return vo;
    }

    @Override
    public List<Tool> hotTools(int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        QueryWrapper<Tool> qw = new QueryWrapper<>();
        qw.orderByDesc("useCount").last("limit " + safeLimit);
        return toolService.list(qw);
    }

    @Override
    public List<Tool> hotToolsByUsers(int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        List<Long> rankedIds = usageRecordService.rankToolIdsByDistinctUser(safeLimit);
        if (rankedIds.isEmpty()) {
            return new ArrayList<>();
        }
        // 按排名顺序装配（后台统计含上下架，不过滤 status）
        Map<Long, Tool> toolMap = new HashMap<>();
        for (Tool t : toolService.listByIds(rankedIds)) {
            toolMap.put(t.getId(), t);
        }
        List<Tool> result = new ArrayList<>(rankedIds.size());
        for (Long id : rankedIds) {
            Tool t = toolMap.get(id);
            if (t != null) {
                result.add(t);
            }
        }
        return result;
    }

    @Override
    public List<TrendPointVO> usageTrend(int days) {
        int safeDays = Math.min(Math.max(days, 1), 90);
        LocalDate startDate = LocalDate.now().minusDays(safeDays - 1L);
        Date startTime = Date.from(startDate.atStartOfDay(ZoneId.systemDefault()).toInstant());

        // 拉取区间内记录
        QueryWrapper<ToolUsageRecord> qw = new QueryWrapper<>();
        qw.ge("createTime", startTime).select("createTime");
        List<ToolUsageRecord> records = usageRecordService.list(qw);

        // 按日聚合
        Map<String, Long> dayCount = new HashMap<>();
        for (ToolUsageRecord r : records) {
            if (r.getCreateTime() == null) {
                continue;
            }
            LocalDateTime ldt = LocalDateTime.ofInstant(r.getCreateTime().toInstant(), ZoneId.systemDefault());
            String day = ldt.toLocalDate().format(DAY_FMT);
            dayCount.merge(day, 1L, Long::sum);
        }

        // 从 startDate 到今天逐日补 0
        List<TrendPointVO> result = new ArrayList<>(safeDays);
        for (int i = 0; i < safeDays; i++) {
            LocalDate d = startDate.plusDays(i);
            String day = d.format(DAY_FMT);
            result.add(new TrendPointVO(day, dayCount.getOrDefault(day, 0L)));
        }
        return result;
    }
}
