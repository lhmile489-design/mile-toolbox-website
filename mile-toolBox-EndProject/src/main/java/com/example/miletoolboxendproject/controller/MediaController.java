package com.example.miletoolboxendproject.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import com.example.miletoolboxendproject.ratelimit.RateLimit;
import com.example.miletoolboxendproject.service.MediaService;
import com.example.miletoolboxendproject.utils.AuthUtils;
import com.example.miletoolboxendproject.utils.FileValidator;
import com.example.miletoolboxendproject.common.Result;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * 媒体处理接口（基于 FFmpeg，异步任务）。
 * <p>
 * 接口列表：
 * - POST /media/compress       视频压缩
 * - POST /media/convert-video  视频格式转换
 * - POST /media/extract-audio  视频提取音频
 * - POST /media/convert-audio  音频格式转换
 * <p>
 * 所有接口返回 { taskId } 供前端轮询 GET /task/{taskId}。
 */
@SaIgnore
@RestController
@RequestMapping("/media")
public class MediaController {

    @Resource
    private MediaService mediaService;

    /**
     * 视频压缩。
     *
     * @param file       源视频（mp4/avi/mov/mkv/webm，≤500MB）
     * @param quality    压缩质量：high / medium / low（默认 medium）
     * @param resolution 目标分辨率：original / 1080p / 720p / 480p（默认 original）
     */
    @RateLimit
    @PostMapping("/compress")
    public Result<?> compress(@RequestParam("file") MultipartFile file,
                              @RequestParam(value = "quality", defaultValue = "medium") String quality,
                              @RequestParam(value = "resolution", defaultValue = "original") String resolution,
                              HttpServletRequest request) {
        FileValidator.requireExtension(file, "mp4", "avi", "mov", "mkv", "webm");
        String taskId = mediaService.compressVideo(file, quality, resolution,
                AuthUtils.currentUserIdOrNull(), request.getRemoteAddr());
        return Result.success(java.util.Map.of("taskId", taskId));
    }

    /**
     * 视频格式转换。
     *
     * @param file   源视频（mp4/avi/mov/mkv/webm）
     * @param format 目标格式：mp4 / avi / mov / mkv / webm
     */
    @RateLimit
    @PostMapping("/convert-video")
    public Result<?> convertVideo(@RequestParam("file") MultipartFile file,
                                  @RequestParam("format") String format,
                                  HttpServletRequest request) {
        FileValidator.requireExtension(file, "mp4", "avi", "mov", "mkv", "webm");
        String taskId = mediaService.convertVideo(file, format,
                AuthUtils.currentUserIdOrNull(), request.getRemoteAddr());
        return Result.success(java.util.Map.of("taskId", taskId));
    }

    /**
     * 视频提取音频。
     *
     * @param file   源视频（mp4/avi/mov/mkv）
     * @param format 音频格式：mp3 / aac / wav（默认 mp3）
     */
    @RateLimit
    @PostMapping("/extract-audio")
    public Result<?> extractAudio(@RequestParam("file") MultipartFile file,
                                  @RequestParam(value = "format", defaultValue = "mp3") String format,
                                  HttpServletRequest request) {
        FileValidator.requireExtension(file, "mp4", "avi", "mov", "mkv");
        String taskId = mediaService.extractAudio(file, format,
                AuthUtils.currentUserIdOrNull(), request.getRemoteAddr());
        return Result.success(java.util.Map.of("taskId", taskId));
    }

    /**
     * 音频格式转换。
     *
     * @param file   源音频（mp3/wav/aac/flac/ogg）
     * @param format 目标格式：mp3 / wav / aac / flac / ogg
     */
    @RateLimit
    @PostMapping("/convert-audio")
    public Result<?> convertAudio(@RequestParam("file") MultipartFile file,
                                  @RequestParam("format") String format,
                                  HttpServletRequest request) {
        FileValidator.requireExtension(file, "mp3", "wav", "aac", "flac", "ogg");
        String taskId = mediaService.convertAudio(file, format,
                AuthUtils.currentUserIdOrNull(), request.getRemoteAddr());
        return Result.success(java.util.Map.of("taskId", taskId));
    }
}
