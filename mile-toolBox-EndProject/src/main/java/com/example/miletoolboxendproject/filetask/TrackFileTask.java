package com.example.miletoolboxendproject.filetask;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 标记需要记录「文件处理任务」的处理方法。
 * <p>由 {@link FileTaskAspect} 切面拦截：从方法入参（MultipartFile/MultipartFile[]）提取文件信息，
 * 计时执行，成功/失败均落 {@code tool_file_task} 表。记录失败不影响主流程。
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface TrackFileTask {

    /**
     * 工具标识（如 pdf-merge）。用于任务记录归类。
     */
    String value();
}
