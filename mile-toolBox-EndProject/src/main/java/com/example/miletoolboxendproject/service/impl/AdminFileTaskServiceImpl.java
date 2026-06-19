package com.example.miletoolboxendproject.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.miletoolboxendproject.common.PageResult;
import com.example.miletoolboxendproject.domain.ToolFileTask;
import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.mapper.ToolFileTaskMapper;
import com.example.miletoolboxendproject.service.AdminFileTaskService;
import com.example.miletoolboxendproject.vo.FileTaskStatsVO;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

/**
 * 后台文件任务监控服务实现。
 */
@Service
public class AdminFileTaskServiceImpl implements AdminFileTaskService {

    @Resource
    private ToolFileTaskMapper fileTaskMapper;

    @Override
    public PageResult<ToolFileTask> page(int pageNum, int size, String toolKey, Integer status, String keyword) {
        int safePage = Math.max(pageNum, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);

        QueryWrapper<ToolFileTask> qw = new QueryWrapper<>();
        if (StringUtils.hasText(toolKey)) {
            qw.eq("toolKey", toolKey.trim());
        }
        if (status != null) {
            qw.eq("status", status);
        }
        if (StringUtils.hasText(keyword)) {
            String kw = keyword.trim();
            qw.and(w -> w.like("fileName", kw).or().like("clientIp", kw));
        }
        qw.orderByDesc("id");

        Page<ToolFileTask> p = fileTaskMapper.selectPage(new Page<>(safePage, safeSize), qw);
        return PageResult.of(p);
    }

    @Override
    public ToolFileTask detail(Long id) {
        ToolFileTask task = fileTaskMapper.selectById(id);
        if (task == null) {
            throw new BusinessException(ErrCode.TASK_NOT_FOUND);
        }
        return task;
    }

    @Override
    public FileTaskStatsVO stats() {
        FileTaskStatsVO vo = new FileTaskStatsVO();
        vo.setTotal(fileTaskMapper.selectCount(null));

        QueryWrapper<ToolFileTask> successQw = new QueryWrapper<>();
        successQw.eq("status", 0);
        vo.setSuccessCount(fileTaskMapper.selectCount(successQw));

        QueryWrapper<ToolFileTask> failQw = new QueryWrapper<>();
        failQw.eq("status", 1);
        vo.setFailCount(fileTaskMapper.selectCount(failQw));

        Date todayStart = Date.from(LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant());
        QueryWrapper<ToolFileTask> todayQw = new QueryWrapper<>();
        todayQw.ge("createTime", todayStart);
        vo.setTodayCount(fileTaskMapper.selectCount(todayQw));
        return vo;
    }
}
