package com.example.miletoolboxendproject.service;

/**
 * 对象存储服务（腾讯云 COS）。未启用时 {@link #isEnabled()} 返回 false，调用方回退为直接返回流。
 */
public interface StorageService {

    /**
     * COS 是否已启用（配置了密钥）
     */
    boolean isEnabled();

    /**
     * 上传字节数据到 COS
     *
     * @param data        文件字节
     * @param filename    原始文件名（用于推断扩展名）
     * @param contentType MIME 类型，如 application/pdf
     * @return 可公网访问的完整 URL（启用时）；未启用返回 null
     */
    String upload(byte[] data, String filename, String contentType);
}
