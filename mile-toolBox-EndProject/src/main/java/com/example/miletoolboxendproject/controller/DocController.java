package com.example.miletoolboxendproject.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import com.example.miletoolboxendproject.filetask.TrackFileTask;
import com.example.miletoolboxendproject.ratelimit.RateLimit;
import com.example.miletoolboxendproject.service.DocConvertService;
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
 * 文档转换接口（doc-convert，基于服务器 Pandoc）。
 */
@SaIgnore
@RestController
@RequestMapping("/doc")
public class DocController {

    @Resource
    private DocConvertService docConvertService;

    @Resource
    private ToolService toolService;

    @Resource
    private StorageService storageService;

    /**
     * 文档格式转换（doc→MD / MD→html / md→docx 等）。
     *
     * @param file   源文档（docx/md/markdown/html/htm/txt/rtf/odt/epub）
     * @param format 目标格式（md/html/docx/txt）
     * @param save   是否上传对象存储返回 URL（默认 false 直接下载）
     */
    @RateLimit
    @TrackFileTask("doc-convert")
    @PostMapping("/convert")
    public ResponseEntity<?> convert(@RequestParam("file") MultipartFile file,
                                     @RequestParam("format") String format,
                                     @RequestParam(value = "save", defaultValue = "false") boolean save) {
        FileValidator.requireNotEmpty(file);
        DocConvertService.ConvertResult r = docConvertService.convert(file, format);
        toolService.reportUse("doc-convert", AuthUtils.currentUserIdOrNull());
        return FileDelivery.deliver(r.data(), r.filename(), r.contentType(), save, storageService);
    }
}
