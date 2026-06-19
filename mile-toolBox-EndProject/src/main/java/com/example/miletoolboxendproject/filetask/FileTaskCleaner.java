package com.example.miletoolboxendproject.filetask;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.example.miletoolboxendproject.domain.ToolFileTask;
import com.example.miletoolboxendproject.mapper.ToolFileTaskMapper;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;

/**
 * 异步任务过期产物清理器。
 * <p>独立组件（不实现接口），避免与 {@code AsyncFileTaskServiceImpl} 的 JDK 动态代理冲突
 * （{@code @Scheduled} 方法必须能被代理调用；接口代理无法暴露非接口方法）。
 */
@Slf4j
@Component
public class FileTaskCleaner {

    @Resource
    private ToolFileTaskMapper fileTaskMapper;

    /**
     * 定时清理过期的本地产物文件（每 30 分钟）。
     * <p>仅清理未启用 COS 时落本地的产物（resultPath 非空且 expireTime 已过）：删除文件并清空 resultPath。
     * COS 产物由对象存储侧生命周期管理，不在此处理。异常吞掉不影响调度。
     */
    @Scheduled(fixedDelay = 30 * 60 * 1000L, initialDelay = 60 * 1000L)
    public void cleanupExpiredProducts() {
        try {
            QueryWrapper<ToolFileTask> qw = new QueryWrapper<>();
            qw.eq("async", 1)
                    .isNotNull("resultPath")
                    .le("expireTime", new Date())
                    .last("limit 200");
            List<ToolFileTask> expired = fileTaskMapper.selectList(qw);
            for (ToolFileTask t : expired) {
                try {
                    Files.deleteIfExists(Paths.get(t.getResultPath()));
                } catch (Exception e) {
                    log.warn("清理过期产物文件失败 taskId={}: {}", t.getTaskId(), e.getMessage());
                }
                // updateById 不会把字段置 NULL，需用 UpdateWrapper 显式 set null
                UpdateWrapper<ToolFileTask> uw = new UpdateWrapper<>();
                uw.eq("id", t.getId()).set("resultPath", null);
                fileTaskMapper.update(null, uw);
            }
            if (!expired.isEmpty()) {
                log.info("清理过期异步产物 {} 个", expired.size());
            }
        } catch (Exception e) {
            log.warn("过期产物清理任务异常: {}", e.getMessage());
        }
    }
}
