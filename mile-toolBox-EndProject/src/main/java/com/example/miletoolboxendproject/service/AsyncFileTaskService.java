package com.example.miletoolboxendproject.service;

import com.example.miletoolboxendproject.domain.ToolFileTask;
import com.example.miletoolboxendproject.filetask.FileTaskProcessor;

/**
 * 异步文件任务框架服务。
 * <p>通用骨架：提交任务 → 落 PENDING 记录返回 taskId → 后台线程池处理 → 更新状态/产物 →
 * 调用方轮询状态、按 taskId 下载产物。与具体工具解耦（工具提供 {@link FileTaskProcessor}）。
 * <p>现有同步 PDF/图片/文档处理不走本框架，仅未来耗时工具（如视频转码）使用。
 */
public interface AsyncFileTaskService {

    /**
     * 提交一个异步文件任务。立即返回（不阻塞），实际处理在后台线程池执行。
     *
     * @param toolKey   工具标识（如 video-transcode）
     * @param fileName  输入文件名（用于展示，可空）
     * @param fileSize  输入文件总大小（字节）
     * @param fileCount 输入文件数量
     * @param userId    提交用户ID（游客为空）
     * @param clientIp  客户端IP（可空）
     * @param processor 实际处理逻辑（在后台线程执行）
     * @return 任务UUID（taskId）
     */
    String submit(String toolKey, String fileName, long fileSize, int fileCount,
                  Long userId, String clientIp, FileTaskProcessor processor);

    /**
     * 按 taskId 查任务（含状态/进度/产物信息）。不存在返回 null。
     */
    ToolFileTask getByTaskId(String taskId);

    /**
     * 后台异步执行任务（由 {@link #submit} 内部经代理调用，使 {@code @Async} 生效）。
     * <p>声明在接口上是为了让 JDK 动态代理能暴露该方法；业务方不直接调用。
     *
     * @param taskId    任务UUID
     * @param processor 处理逻辑
     */
    void runAsync(String taskId, com.example.miletoolboxendproject.filetask.FileTaskProcessor processor);
}
