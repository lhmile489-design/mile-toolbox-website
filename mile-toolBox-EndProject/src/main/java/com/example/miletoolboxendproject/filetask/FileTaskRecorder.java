package com.example.miletoolboxendproject.filetask;

import com.example.miletoolboxendproject.domain.ToolFileTask;
import com.example.miletoolboxendproject.mapper.ToolFileTaskMapper;
import jakarta.annotation.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * 文件处理任务记录器。
 * <p>独立于切面，便于复用与单测。落库异常被吞掉（仅记日志），保证不影响主处理流程。
 */
@Component
public class FileTaskRecorder {

    private static final Logger log = LoggerFactory.getLogger(FileTaskRecorder.class);

    /** 状态：成功 */
    public static final int STATUS_SUCCESS = 0;
    /** 状态：失败 */
    public static final int STATUS_FAIL = 1;

    @Resource
    private ToolFileTaskMapper fileTaskMapper;

    /**
     * 落一条任务记录。任何异常都被吞掉，绝不抛出（不能让监控记录拖垮业务）。
     */
    public void record(ToolFileTask task) {
        try {
            fileTaskMapper.insert(task);
        } catch (Exception e) {
            log.warn("文件任务记录落库失败 toolKey={} status={}: {}",
                    task.getToolKey(), task.getStatus(), e.getMessage());
        }
    }
}
