package com.example.miletoolboxendproject.utils;

import com.example.miletoolboxendproject.common.Result;
import com.example.miletoolboxendproject.service.StorageService;
import com.example.miletoolboxendproject.vo.FileResultVO;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * 文件处理结果交付：
 * <ul>
 *   <li>save=true 且 COS 已启用 → 上传 COS，返回 JSON {@link Result}&lt;{@link FileResultVO}&gt;（含 url）；</li>
 *   <li>否则 → 直接返回附件文件流（attachment）。</li>
 * </ul>
 */
public final class FileDelivery {

    private FileDelivery() {
    }

    /**
     * 交付处理结果。
     *
     * @param data        结果字节
     * @param filename    文件名
     * @param contentType MIME 类型
     * @param save        是否上传到对象存储返回 URL
     * @param storage     存储服务
     * @return 文件流 或 JSON（含 url）
     */
    public static ResponseEntity<?> deliver(byte[] data, String filename, String contentType,
                                            boolean save, StorageService storage) {
        if (save && storage.isEnabled()) {
            String url = storage.upload(data, filename, contentType);
            return ResponseEntity.ok(Result.success(new FileResultVO(url, filename, data.length)));
        }
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"; filename*=UTF-8''" + encoded)
                .contentType(MediaType.parseMediaType(contentType))
                .contentLength(data.length)
                .body(new ByteArrayResource(data));
    }
}
