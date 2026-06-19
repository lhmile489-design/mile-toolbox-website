package com.example.miletoolboxendproject.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import com.example.miletoolboxendproject.filetask.TrackFileTask;
import com.example.miletoolboxendproject.ratelimit.RateLimit;
import com.example.miletoolboxendproject.service.PdfToolService;
import com.example.miletoolboxendproject.service.StorageService;
import com.example.miletoolboxendproject.service.ToolService;
import com.example.miletoolboxendproject.utils.AuthUtils;
import com.example.miletoolboxendproject.utils.FileDelivery;
import com.example.miletoolboxendproject.utils.FileValidator;
import jakarta.annotation.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * PDF 文件处理接口（后端处理工具）。
 * <p>公开访问（带 token 则计入个人使用历史）；处理成功后记录工具使用。
 * <p>每个端点支持 {@code save} 参数：true 且 COS 已启用时上传对象存储并返回 JSON（含 url），
 * 否则直接返回文件流。
 */
@SaIgnore
@RestController
@RequestMapping("/pdf")
public class PdfController {

    /** 单次最多合并文件数 */
    private static final int MAX_MERGE_FILES = 20;

    @Resource
    private PdfToolService pdfToolService;

    @Resource
    private ToolService toolService;

    @Resource
    private StorageService storageService;

    /**
     * PDF 合并
     *
     * @param files 多个 PDF 文件（顺序即合并顺序）
     * @param save  是否上传对象存储返回 URL（默认 false 直接下载）
     */
    @RateLimit
    @TrackFileTask("pdf-merge")
    @PostMapping("/merge")
    public ResponseEntity<?> merge(@RequestParam("files") MultipartFile[] files,
                                   @RequestParam(value = "save", defaultValue = "false") boolean save) {
        FileValidator.requireFiles(files, 2, MAX_MERGE_FILES);
        FileValidator.requireExtension(files, "pdf");
        byte[] result = pdfToolService.merge(files);
        toolService.reportUse("pdf-merge", AuthUtils.currentUserIdOrNull());
        return FileDelivery.deliver(result, "merged.pdf", MediaType.APPLICATION_PDF_VALUE, save, storageService);
    }

    /**
     * PDF 拆分（按页码范围提取）
     */
    @RateLimit
    @TrackFileTask("pdf-split")
    @PostMapping("/split")
    public ResponseEntity<?> split(@RequestParam("file") MultipartFile file,
                                   @RequestParam("range") String range,
                                   @RequestParam(value = "save", defaultValue = "false") boolean save) {
        FileValidator.requireExtension(file, "pdf");
        byte[] result = pdfToolService.splitByRange(file, range);
        toolService.reportUse("pdf-split", AuthUtils.currentUserIdOrNull());
        return FileDelivery.deliver(result, "split.pdf", MediaType.APPLICATION_PDF_VALUE, save, storageService);
    }

    /**
     * PDF 加水印（对角线文字水印，当前支持英文/数字）
     */
    @RateLimit
    @TrackFileTask("pdf-watermark")
    @PostMapping("/watermark")
    public ResponseEntity<?> watermark(@RequestParam("file") MultipartFile file,
                                       @RequestParam("text") String text,
                                       @RequestParam(value = "save", defaultValue = "false") boolean save) {
        FileValidator.requireExtension(file, "pdf");
        byte[] result = pdfToolService.addTextWatermark(file, text);
        toolService.reportUse("pdf-watermark", AuthUtils.currentUserIdOrNull());
        return FileDelivery.deliver(result, "watermarked.pdf", MediaType.APPLICATION_PDF_VALUE, save, storageService);
    }

    /**
     * PDF 加密（设置打开密码）
     */
    @RateLimit
    @TrackFileTask("pdf-encrypt")
    @PostMapping("/encrypt")
    public ResponseEntity<?> encrypt(@RequestParam("file") MultipartFile file,
                                     @RequestParam("password") String password,
                                     @RequestParam(value = "save", defaultValue = "false") boolean save) {
        FileValidator.requireExtension(file, "pdf");
        byte[] result = pdfToolService.encrypt(file, password);
        toolService.reportUse("pdf-encrypt", AuthUtils.currentUserIdOrNull());
        return FileDelivery.deliver(result, "encrypted.pdf", MediaType.APPLICATION_PDF_VALUE, save, storageService);
    }

    /**
     * PDF 转图片（逐页 PNG 打包 ZIP）
     */
    @RateLimit
    @TrackFileTask("pdf-image")
    @PostMapping("/to-image")
    public ResponseEntity<?> toImage(@RequestParam("file") MultipartFile file,
                                     @RequestParam(value = "dpi", defaultValue = "150") int dpi,
                                     @RequestParam(value = "save", defaultValue = "false") boolean save) {
        FileValidator.requireExtension(file, "pdf");
        byte[] result = pdfToolService.pdfToImagesZip(file, dpi);
        toolService.reportUse("pdf-image", AuthUtils.currentUserIdOrNull());
        return FileDelivery.deliver(result, "pdf-images.zip", "application/zip", save, storageService);
    }

    /**
     * 图片转 PDF（多图合成，每图一页）
     */
    @RateLimit
    @TrackFileTask("pdf-image")
    @PostMapping("/from-image")
    public ResponseEntity<?> fromImage(@RequestParam("files") MultipartFile[] files,
                                       @RequestParam(value = "save", defaultValue = "false") boolean save) {
        FileValidator.requireFiles(files, 1, MAX_MERGE_FILES);
        FileValidator.requireExtension(files, "png", "jpg", "jpeg");
        byte[] result = pdfToolService.imagesToPdf(files);
        toolService.reportUse("pdf-image", AuthUtils.currentUserIdOrNull());
        return FileDelivery.deliver(result, "images.pdf", MediaType.APPLICATION_PDF_VALUE, save, storageService);
    }
}
