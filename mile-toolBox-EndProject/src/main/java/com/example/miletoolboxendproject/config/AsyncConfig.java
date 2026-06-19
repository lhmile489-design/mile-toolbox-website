package com.example.miletoolboxendproject.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.ThreadPoolExecutor;

/**
 * 异步任务线程池配置。
 * <p>用于文件异步处理框架（耗时工具：提交→后台线程处理→轮询/下载）。
 * <p>有界队列 + {@link ThreadPoolExecutor.CallerRunsPolicy}：队列满时由提交线程兜底执行，
 * 宁可降级（变同步）也不丢任务、不抛拒绝异常——符合本项目"降级而非中断"的纪律。
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {

    /** 文件异步处理线程池 bean 名（@Async 引用） */
    public static final String FILE_TASK_EXECUTOR = "fileTaskExecutor";

    @Bean(FILE_TASK_EXECUTOR)
    public ThreadPoolTaskExecutor fileTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(50);
        executor.setKeepAliveSeconds(60);
        executor.setThreadNamePrefix("file-task-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        // 优雅停机：等待在途任务完成，避免产物处理一半丢失
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }
}
