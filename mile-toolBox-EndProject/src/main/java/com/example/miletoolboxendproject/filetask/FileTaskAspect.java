package com.example.miletoolboxendproject.filetask;

import com.example.miletoolboxendproject.domain.ToolFileTask;
import com.example.miletoolboxendproject.utils.AuthUtils;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;

/**
 * 文件处理任务记录切面。
 * <p>拦截 {@link TrackFileTask} 注解的方法：从入参提取文件信息（名称/大小/数量），计时执行，
 * 无论成功或抛异常都落一条 {@code tool_file_task} 记录，然后原样放行/重抛（不改变原有行为）。
 */
@Aspect
@Component
public class FileTaskAspect {

    @Resource
    private FileTaskRecorder recorder;

    @Around("@annotation(trackFileTask)")
    public Object around(ProceedingJoinPoint joinPoint, TrackFileTask trackFileTask) throws Throwable {
        long start = System.currentTimeMillis();
        FileInfo info = extractFiles(joinPoint.getArgs());

        try {
            Object ret = joinPoint.proceed();
            record(trackFileTask.value(), info, FileTaskRecorder.STATUS_SUCCESS, null, start);
            return ret;
        } catch (Throwable ex) {
            String msg = ex.getMessage();
            record(trackFileTask.value(), info,
                    FileTaskRecorder.STATUS_FAIL, truncate(msg), start);
            throw ex;
        }
    }

    private void record(String toolKey, FileInfo info, int status, String errorMsg, long start) {
        ToolFileTask task = new ToolFileTask();
        task.setToolKey(toolKey);
        task.setFileName(info.name);
        task.setFileSize(info.size);
        task.setFileCount(info.count);
        task.setStatus(status);
        task.setErrorMsg(errorMsg);
        task.setCostMs(System.currentTimeMillis() - start);
        task.setUserId(AuthUtils.currentUserIdOrNull());
        task.setClientIp(clientIp());
        task.setCreateTime(new Date());
        recorder.record(task);
    }

    /** 从方法入参中提取 MultipartFile / MultipartFile[]，汇总文件名、总大小、数量 */
    private FileInfo extractFiles(Object[] args) {
        FileInfo info = new FileInfo();
        if (args == null) {
            return info;
        }
        String firstName = null;
        for (Object arg : args) {
            if (arg instanceof MultipartFile f) {
                if (firstName == null) {
                    firstName = f.getOriginalFilename();
                }
                info.size += f.getSize();
                info.count += 1;
            } else if (arg instanceof MultipartFile[] arr) {
                for (MultipartFile f : arr) {
                    if (f == null) {
                        continue;
                    }
                    if (firstName == null) {
                        firstName = f.getOriginalFilename();
                    }
                    info.size += f.getSize();
                    info.count += 1;
                }
            }
        }
        // 文件名：单文件用其名；多文件用「首个 等N个」
        if (firstName != null) {
            info.name = info.count > 1 ? firstName + " 等" + info.count + "个" : firstName;
        }
        return info;
    }

    /** 取客户端真实 IP（兼容反向代理）；无请求上下文返回 null */
    private String clientIp() {
        ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            return null;
        }
        HttpServletRequest request = attrs.getRequest();
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

    private static String truncate(String s) {
        if (s == null) {
            return "处理失败";
        }
        return s.length() > 480 ? s.substring(0, 480) : s;
    }

    /** 文件信息汇总载体 */
    private static class FileInfo {
        String name;
        long size = 0L;
        int count = 0;
    }
}
