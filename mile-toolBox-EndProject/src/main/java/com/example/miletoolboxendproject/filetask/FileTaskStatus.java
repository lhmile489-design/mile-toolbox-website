package com.example.miletoolboxendproject.filetask;

/**
 * 文件任务状态常量。
 * <p>同步流水（{@code @TrackFileTask}）只用 {@link #SUCCESS}/{@link #FAIL} 两态；
 * 异步任务额外用 {@link #PENDING}/{@link #PROCESSING} 两个中间态。
 */
public final class FileTaskStatus {

    private FileTaskStatus() {
    }

    /** 成功（终态） */
    public static final int SUCCESS = 0;
    /** 失败（终态） */
    public static final int FAIL = 1;
    /** 待处理（异步，已入队未开始） */
    public static final int PENDING = 2;
    /** 处理中（异步） */
    public static final int PROCESSING = 3;
}
