package com.example.miletoolboxendproject.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * 图片处理服务。
 */
public interface ImageToolService {

    /**
     * 图片格式转换
     *
     * @param file         源图片（支持 png/jpg/jpeg/bmp/gif/webp/tiff 读取）
     * @param targetFormat 目标格式（png/jpg/jpeg/bmp/gif）
     * @param quality      输出质量 0.1~1.0（对 jpg 有效，可空，默认 0.9）
     * @return 转换后的图片字节
     */
    byte[] convert(MultipartFile file, String targetFormat, Float quality);
}
