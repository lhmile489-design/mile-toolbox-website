package com.example.miletoolboxendproject.service.impl;

import com.example.miletoolboxendproject.config.AsyncConfig;
import com.example.miletoolboxendproject.config.ToolboxProperties;
import com.example.miletoolboxendproject.domain.ToolFileTask;
import com.example.miletoolboxendproject.filetask.FileTaskProcessor;
import com.example.miletoolboxendproject.filetask.FileTaskResult;
import com.example.miletoolboxendproject.filetask.FileTaskStatus;
import com.example.miletoolboxendproject.mapper.ToolFileTaskMapper;
import com.example.miletoolboxendproject.service.AsyncFileTaskService;
import com.example.miletoolboxendproject.service.StorageService;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * 异步文件任务框架实现。
 * <p>状态流转：PENDING → PROCESSING → SUCCESS/FAIL。产物优先传 COS（resultUrl），
 * 未启用 COS 则落本地临时目录（resultPath），并设过期时间供定时清理。
 */
@Slf4j
@Service
public class AsyncFileTaskServiceImpl implements AsyncFileTaskService {

    @Resource
    private ToolFileTaskMapper fileTaskMapper;

    @Resource
    private StorageService storageService;

    @Resource
    private ToolboxProperties toolboxProperties;

    /** 自注入以走 Spring 代理，使同类内 {@code @Async} 方法异步生效 */
    @Resource
    @Lazy
    private AsyncFileTaskService self;

    @Override
    public String submit(String toolKey, String fileName, long fileSize, int fileCount,
                         Long userId, String clientIp, FileTaskProcessor processor) {
        String taskId = UUID.randomUUID().toString();
        ToolFileTask task = new ToolFileTask();
        task.setTaskId(taskId);
        task.setToolKey(toolKey);
        task.setAsync(1);
        task.setFileName(fileName);
        task.setFileSize(fileSize);
        task.setFileCount(Math.max(fileCount, 0));
        task.setStatus(FileTaskStatus.PENDING);
        task.setProgress(0);
        task.setUserId(userId);
        task.setClientIp(clientIp);
        task.setCreateTime(new Date());
        fileTaskMapper.insert(task);
        // 走代理异步执行；线程池满时 CallerRuns 兜底（降级为同步）
        self.runAsync(taskId, processor);
        return taskId;
    }

    /**
     * 后台执行任务。异常不外抛（异步线程无人接），统一落 FAIL。
     */
    @Override
    @Async(AsyncConfig.FILE_TASK_EXECUTOR)
    public void runAsync(String taskId, FileTaskProcessor processor) {
        long start = System.currentTimeMillis();
        ToolFileTask task = getByTaskId(taskId);
        if (task == null) {
            log.warn("异步任务不存在，跳过 taskId={}", taskId);
            return;
        }
        // 进入处理中
        updateStatus(task.getId(), FileTaskStatus.PROCESSING, 0, null);
        try {
            FileTaskProcessor.ProgressReporter reporter = pct -> updateProgress(task.getId(), pct);
            FileTaskResult result = processor.process(reporter);
            persistResult(task, result, System.currentTimeMillis() - start);
        } catch (Exception e) {
            log.error("异步任务处理失败 taskId={}", taskId, e);
            markFail(task.getId(), e.getMessage(), System.currentTimeMillis() - start);
        }
    }

    @Override
    public ToolFileTask getByTaskId(String taskId) {
        if (taskId == null || taskId.isBlank()) {
            return null;
        }
        QueryWrapper<ToolFileTask> qw = new QueryWrapper<>();
        qw.eq("taskId", taskId).last("limit 1");
        return fileTaskMapper.selectOne(qw);
    }

    /** 成功：产物优先 COS，否则落本地临时目录 */
    private void persistResult(ToolFileTask task, FileTaskResult result, long costMs) {
        ToolFileTask update = new ToolFileTask();
        update.setId(task.getId());
        update.setStatus(FileTaskStatus.SUCCESS);
        update.setProgress(100);
        update.setResultName(result.filename());
        update.setResultType(result.contentType());
        update.setCostMs(costMs);

        long ttl = toolboxProperties.getTempTtlSeconds();
        update.setExpireTime(new Date(System.currentTimeMillis() + TimeUnit.SECONDS.toMillis(ttl)));

        if (storageService.isEnabled()) {
            String url = storageService.upload(result.data(), result.filename(), result.contentType());
            update.setResultUrl(url);
        } else {
            String path = writeTempProduct(task.getTaskId(), result);
            update.setResultPath(path);
        }
        fileTaskMapper.updateById(update);
    }

    /** 未启用 COS 时，把产物写到临时目录，返回绝对路径 */
    private String writeTempProduct(String taskId, FileTaskResult result) {
        try {
            Path dir = Paths.get(toolboxProperties.getTempDir(), "async");
            Files.createDirectories(dir);
            String safeName = (taskId + "_" + result.filename()).replaceAll("[\\\\/:*?\"<>|]", "_");
            Path file = dir.resolve(safeName);
            Files.write(file, result.data());
            return file.toAbsolutePath().toString();
        } catch (Exception e) {
            log.error("异步产物落本地失败 taskId={}", taskId, e);
            throw new RuntimeException("产物存储失败", e);
        }
    }

    private void updateStatus(Long id, int status, int progress, String errorMsg) {
        ToolFileTask u = new ToolFileTask();
        u.setId(id);
        u.setStatus(status);
        u.setProgress(progress);
        u.setErrorMsg(errorMsg);
        fileTaskMapper.updateById(u);
    }

    private void updateProgress(Long id, int percent) {
        int p = Math.min(Math.max(percent, 0), 100);
        ToolFileTask u = new ToolFileTask();
        u.setId(id);
        u.setProgress(p);
        fileTaskMapper.updateById(u);
    }

    private void markFail(Long id, String msg, long costMs) {
        ToolFileTask u = new ToolFileTask();
        u.setId(id);
        u.setStatus(FileTaskStatus.FAIL);
        u.setErrorMsg(truncate(msg));
        u.setCostMs(costMs);
        fileTaskMapper.updateById(u);
    }

    private static String truncate(String s) {
        if (s == null) {
            return "处理失败";
        }
        return s.length() > 480 ? s.substring(0, 480) : s;
    }
}
