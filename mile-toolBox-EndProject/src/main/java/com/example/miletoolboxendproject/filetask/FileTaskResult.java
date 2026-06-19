package com.example.miletoolboxendproject.filetask;

/**
 * 异步文件任务的处理产物。
 *
 * @param data        产物字节
 * @param filename    产物文件名
 * @param contentType 产物 MIME 类型
 */
public record FileTaskResult(byte[] data, String filename, String contentType) {
}
