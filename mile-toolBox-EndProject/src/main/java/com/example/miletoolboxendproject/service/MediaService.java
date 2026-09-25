package com.example.miletoolboxendproject.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * 媒体处理服务（基于 FFmpeg）。
 * 所有接口走异步任务框架，返回 taskId 供前端轮询。
 */
public interface MediaService {

    /** 是否启用（服务器已安装 FFmpeg 且配置 enabled=true） */
    boolean isEnabled();

    /**
     * 视频压缩。
     *
     * @param file       源视频（mp4/avi/mov/mkv/webm）
     * @param quality    压缩质量：high / medium / low，默认 medium
     * @param resolution 目标分辨率：original / 1080p / 720p / 480p，默认 original
     * @param userId     用户ID（可空）
     * @param clientIp   客户端IP（可空）
     * @return taskId
     */
    String compressVideo(MultipartFile file, String quality, String resolution,
                         Long userId, String clientIp);

    /**
     * 视频格式转换。
     *
     * @param file     源视频（mp4/avi/mov/mkv/webm）
     * @param format   目标格式：mp4 / avi / mov / mkv / webm
     * @param userId   用户ID（可空）
     * @param clientIp 客户端IP（可空）
     * @return taskId
     */
    String convertVideo(MultipartFile file, String format, Long userId, String clientIp);

    /**
     * 视频提取音频。
     *
     * @param file     源视频（mp4/avi/mov/mkv）
     * @param format   音频格式：mp3 / aac / wav，默认 mp3
     * @param userId   用户ID（可空）
     * @param clientIp 客户端IP（可空）
     * @return taskId
     */
    String extractAudio(MultipartFile file, String format, Long userId, String clientIp);

    /**
     * 音频格式转换。
     *
     * @param file     源音频（mp3/wav/aac/flac/ogg）
     * @param format   目标格式：mp3 / wav / aac / flac / ogg
     * @param userId   用户ID（可空）
     * @param clientIp 客户端IP（可空）
     * @return taskId
     */
    String convertAudio(MultipartFile file, String format, Long userId, String clientIp);
}
