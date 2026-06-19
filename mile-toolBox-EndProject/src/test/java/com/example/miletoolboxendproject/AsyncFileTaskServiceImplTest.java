package com.example.miletoolboxendproject;

import com.example.miletoolboxendproject.domain.ToolFileTask;
import com.example.miletoolboxendproject.filetask.FileTaskResult;
import com.example.miletoolboxendproject.filetask.FileTaskStatus;
import com.example.miletoolboxendproject.service.AsyncFileTaskService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

/**
 * 异步文件任务框架端到端集成测试（真实 Spring 上下文 + 线程池 + DB）。
 * <p>验证：提交 → PENDING/PROCESSING → SUCCESS 流转、进度推进、产物落地（本地路径，未启用 COS）、
 * 失败任务落 FAIL + errorMsg。
 */
@SpringBootTest
class AsyncFileTaskServiceImplTest {

    @Autowired
    private AsyncFileTaskService asyncFileTaskService;

    /** 轮询任务直到终态或超时 */
    private ToolFileTask awaitTerminal(String taskId, long timeoutMs) throws InterruptedException {
        long deadline = System.currentTimeMillis() + timeoutMs;
        while (System.currentTimeMillis() < deadline) {
            ToolFileTask t = asyncFileTaskService.getByTaskId(taskId);
            if (t != null && t.getStatus() != null
                    && (t.getStatus() == FileTaskStatus.SUCCESS || t.getStatus() == FileTaskStatus.FAIL)) {
                return t;
            }
            Thread.sleep(50);
        }
        return asyncFileTaskService.getByTaskId(taskId);
    }

    @Test
    void submit_success_persistsResultAndProgress() throws InterruptedException {
        byte[] payload = "hello-async".getBytes(StandardCharsets.UTF_8);
        String taskId = asyncFileTaskService.submit(
                "test-async", "in.txt", payload.length, 1, 42L, "127.0.0.1",
                progress -> {
                    progress.report(50);
                    return new FileTaskResult(payload, "out.txt", "text/plain");
                });
        assertNotNull(taskId);

        ToolFileTask t = awaitTerminal(taskId, 5000);
        assertNotNull(t, "任务应已落库");
        assertEquals(FileTaskStatus.SUCCESS, t.getStatus(), "应为成功终态");
        assertEquals(100, t.getProgress(), "成功后进度应为 100");
        assertEquals("out.txt", t.getResultName());
        assertEquals(Integer.valueOf(1), t.getAsync());
        assertEquals(42L, t.getUserId());
        // 未启用 COS：产物落本地路径
        assertTrue(t.getResultUrl() != null || t.getResultPath() != null, "应有产物 URL 或本地路径");
        assertTrue(t.getCostMs() != null && t.getCostMs() >= 0);
    }

    @Test
    void submit_processorThrows_marksFail() throws InterruptedException {
        String taskId = asyncFileTaskService.submit(
                "test-async-fail", "in.txt", 10, 1, null, null,
                progress -> {
                    throw new IllegalStateException("boom-async");
                });

        ToolFileTask t = awaitTerminal(taskId, 5000);
        assertNotNull(t);
        assertEquals(FileTaskStatus.FAIL, t.getStatus(), "处理抛异常应落失败");
        assertNotNull(t.getErrorMsg(), "失败应记录原因");
        assertTrue(t.getErrorMsg().contains("boom-async"), "应保留异常信息");
    }
}
