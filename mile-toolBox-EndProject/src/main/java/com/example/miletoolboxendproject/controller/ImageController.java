package com.example.miletoolboxendproject.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import com.example.miletoolboxendproject.filetask.TrackFileTask;
import com.example.miletoolboxendproject.ratelimit.RateLimit;
import com.example.miletoolboxendproject.service.ImageToolService;
import com.example.miletoolboxendproject.service.StorageService;
import com.example.miletoolboxendproject.service.ToolService;
import com.example.miletoolboxendproject.utils.AuthUtils;
import com.example.miletoolboxendproject.utils.FileDelivery;
import com.example.miletoolboxendproject.utils.FileValidator;
import jakarta.annotation.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * 图片处理接口（后端处理工具）。
 */
@SaIgnore
@RestController
@RequestMapping("/image")
public class ImageController {

    @Resource
    private ImageToolService imageToolService;

    @Resource
    private ToolService toolService;

    @Resource
    private StorageService storageService;

    /**
     * 图片格式转换
     *
     * @param file    源图片（png/jpg/jpeg/bmp/gif/webp/tiff）
     * @param format  目标格式（png/jpg/jpeg/bmp/gif）
     * @param quality 输出质量 0.1~1.0（对 jpg 有效，默认 0.9）
     * @param save    是否上传对象存储返回 URL（默认 false 直接下载）
     */
    @RateLimit
    @TrackFileTask("image-convert")
    @PostMapping("/convert")
    public ResponseEntity<?> convert(@RequestParam("file") MultipartFile file,
                                     @RequestParam("format") String format,
                                     @RequestParam(value = "quality", required = false) Float quality,
                                     @RequestParam(value = "save", defaultValue = "false") boolean save) {
        FileValidator.requireExtension(file, "png", "jpg", "jpeg", "bmp", "gif", "webp", "tif", "tiff");
        byte[] result = imageToolService.convert(file, format, quality);
        toolService.reportUse("image-convert", AuthUtils.currentUserIdOrNull());

        String outExt = "jpeg".equals(format.trim().toLowerCase()) ? "jpg" : format.trim().toLowerCase();
        String filename = "converted." + outExt;
        String mime = "jpg".equals(outExt) ? "image/jpeg" : "image/" + outExt;
        return FileDelivery.deliver(result, filename, mime, save, storageService);
    }
}
