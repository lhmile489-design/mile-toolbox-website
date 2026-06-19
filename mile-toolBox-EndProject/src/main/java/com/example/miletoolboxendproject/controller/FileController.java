package com.example.miletoolboxendproject.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import com.example.miletoolboxendproject.common.Result;
import com.example.miletoolboxendproject.domain.ToolFileTask;
import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.filetask.FileTaskProcessor;
import com.example.miletoolboxendproject.filetask.FileTaskResult;
import com.example.miletoolboxendproject.filetask.FileTaskStatus;
import com.example.miletoolboxendproject.ratelimit.RateLimit;
import com.example.miletoolboxendproject.service.AsyncFileTaskService;
import com.example.miletoolboxendproject.utils.AuthUtils;
import com.example.miletoolboxendproject.utils.FileValidator;
import com.example.miletoolboxendproject.vo.AsyncTaskVO;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 异步文件任务接口（PRD §5.5 预留：提交 → 轮询 → 下载）。
 * <p>当前提供通用框架与一个演示端点 {@code /file/async/echo}（验证骨架端到端）。
 * 未来耗时工具（如视频转码）按同样模式接入：提交后返回 taskId，前端轮询 {@code /file/task/{taskId}}，
 * 完成后用 {@code /file/download/{taskId}} 取产物。
 * <p>现有同步 PDF/图片/文档处理不走本接口，沿用 {@code /pdf}、{@code /image}、{@code /doc}。
 */
@SaIgnore
@RestController
@RequestMapping("/file")
public class FileController {

    @Resource
    private AsyncFileTaskService asyncFileTaskService;

    /**
     * 【演示】提交异步任务：原样回显上传文件（带模拟处理延迟），验证异步框架链路。
     * <p>生产中应替换为真实耗时工具的提交端点。
     *
     * @param file 输入文件
     * @return taskId（用于后续轮询/下载）
     */
    @RateLimit
    @PostMapping("/async/echo")
    public Result<String> submitEcho(@RequestParam("file") MultipartFile file,
                                     HttpServletRequest request) {
        FileValidator.requireNotEmpty(file);
        final byte[] data;
        try {
            data = file.getBytes();
        } catch (Exception e) {
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "读取上传文件失败");
        }
        final String filename = file.getOriginalFilename() == null ? "echo.bin" : file.getOriginalFilename();
        final String contentType = file.getContentType() == null
                ? MediaType.APPLICATION_OCTET_STREAM_VALUE : file.getContentType();

        FileTaskProcessor processor = progress -> {
            // 模拟分阶段耗时处理，演示进度上报
            for (int p = 20; p <= 80; p += 20) {
                Thread.sleep(150);
                progress.report(p);
            }
            return new FileTaskResult(data, "echo-" + filename, contentType);
        };

        String taskId = asyncFileTaskService.submit("async-echo", filename, file.getSize(), 1,
                AuthUtils.currentUserIdOrNull(), clientIp(request), processor);
        return Result.success(taskId);
    }

    /**
     * 查询异步任务状态（轮询）。
     *
     * @param taskId 任务UUID
     * @return 状态/进度/产物信息
     */
    @GetMapping("/task/{taskId}")
    public Result<AsyncTaskVO> task(@PathVariable String taskId) {
        ToolFileTask task = asyncFileTaskService.getByTaskId(taskId);
        if (task == null || task.getAsync() == null || task.getAsync() != 1) {
            throw new BusinessException(ErrCode.TASK_NOT_FOUND);
        }
        return Result.success(AsyncTaskVO.of(task));
    }

    /**
     * 下载异步任务产物。
     * <p>启用 COS 时产物在 {@code resultUrl}（前端直接用 URL，本端点重定向）；
     * 未启用 COS 时产物在本地临时路径，本端点回传文件流。
     *
     * @param taskId 任务UUID
     * @return 文件流 或 302 重定向到 COS URL
     */
    @GetMapping("/download/{taskId}")
    public ResponseEntity<?> download(@PathVariable String taskId) {
        ToolFileTask task = asyncFileTaskService.getByTaskId(taskId);
        if (task == null || task.getAsync() == null || task.getAsync() != 1) {
            throw new BusinessException(ErrCode.TASK_NOT_FOUND);
        }
        if (task.getStatus() == null || task.getStatus() != FileTaskStatus.SUCCESS) {
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "任务尚未完成或已失败");
        }
        // COS 产物：重定向到 URL
        if (task.getResultUrl() != null && !task.getResultUrl().isBlank()) {
            return ResponseEntity.status(302)
                    .header(HttpHeaders.LOCATION, task.getResultUrl())
                    .build();
        }
        // 本地产物：回传文件流
        if (task.getResultPath() == null) {
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "产物不存在或已清理");
        }
        Path path = Paths.get(task.getResultPath());
        if (!Files.exists(path)) {
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "产物已过期或被清理");
        }
        byte[] data;
        try {
            data = Files.readAllBytes(path);
        } catch (Exception e) {
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "读取产物失败");
        }
        String filename = task.getResultName() == null ? "result.bin" : task.getResultName();
        String contentType = task.getResultType() == null
                ? MediaType.APPLICATION_OCTET_STREAM_VALUE : task.getResultType();
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"; filename*=UTF-8''" + encoded)
                .contentType(MediaType.parseMediaType(contentType))
                .contentLength(data.length)
                .body(new ByteArrayResource(data));
    }

    /** 取客户端真实 IP（兼容反向代理） */
    private String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            int comma = xff.indexOf(',');
            return comma > 0 ? xff.substring(0, comma).trim() : xff.trim();
        }
        String real = request.getHeader("X-Real-IP");
        if (real != null && !real.isBlank()) {
            return real.trim();
        }
        return request.getRemoteAddr();
    }
}
