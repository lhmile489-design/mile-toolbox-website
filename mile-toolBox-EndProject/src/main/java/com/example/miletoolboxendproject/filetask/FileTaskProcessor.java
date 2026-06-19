package com.example.miletoolboxendproject.filetask;

/**
 * 异步文件任务的实际处理逻辑（由各耗时工具提供）。
 * <p>骨架与具体工具解耦：提交方传入一个 processor，框架负责调度、状态流转、产物落地。
 * <p>实现中可调用 {@code progress.report(pct)} 上报进度（可选）。
 */
@FunctionalInterface
public interface FileTaskProcessor {

    /**
     * 执行处理，返回产物。抛异常视为任务失败（框架记 FAIL + errorMsg）。
     *
     * @param progress 进度上报器（可忽略）
     * @return 处理产物（字节 + 文件名 + MIME）
     * @throws Exception 处理失败
     */
    FileTaskResult process(ProgressReporter progress) throws Exception;

    /**
     * 进度上报器。
     */
    interface ProgressReporter {
        /**
         * 上报进度百分比（0-100）。实现内部可节流，过于频繁的调用不保证全部落库。
         *
         * @param percent 0-100
         */
        void report(int percent);
    }
}
