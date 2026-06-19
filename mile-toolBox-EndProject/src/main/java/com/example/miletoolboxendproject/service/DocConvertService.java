package com.example.miletoolboxendproject.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * 文档转换服务（Pandoc）。
 */
public interface DocConvertService {

    /**
     * 转换结果（产物字节 + 输出文件名）。
     */
    record ConvertResult(byte[] data, String filename, String contentType) {
    }

    /**
     * 是否启用（服务器已装 Pandoc 且配置启用）
     */
    boolean isEnabled();

    /**
     * 文档格式转换。
     *
     * @param file         源文档（docx/md/html/txt 等）
     * @param targetFormat 目标格式：md / html / docx / txt
     * @return 转换结果
     */
    ConvertResult convert(MultipartFile file, String targetFormat);
}
