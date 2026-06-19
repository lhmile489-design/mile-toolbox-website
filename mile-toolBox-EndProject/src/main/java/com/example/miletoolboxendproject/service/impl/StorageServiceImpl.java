package com.example.miletoolboxendproject.service.impl;

import com.example.miletoolboxendproject.config.ToolboxProperties;
import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.service.StorageService;
import com.qcloud.cos.COSClient;
import com.qcloud.cos.model.ObjectMetadata;
import com.qcloud.cos.model.PutObjectRequest;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * 腾讯云 COS 存储服务实现。
 * <p>{@link COSClient} 为可选依赖（仅 enabled 时存在），用 {@code @Autowired(required=false)} 注入；
 * 未启用时 {@link #isEnabled()} 返回 false。
 */
@Slf4j
@Service
public class StorageServiceImpl implements StorageService {

    @Resource
    private ToolboxProperties toolboxProperties;

    @Autowired(required = false)
    private COSClient cosClient;

    @Override
    public boolean isEnabled() {
        return cosClient != null && toolboxProperties.getCos().isEnabled();
    }

    @Override
    public String upload(byte[] data, String filename, String contentType) {
        if (!isEnabled()) {
            return null;
        }
        ToolboxProperties.Cos cos = toolboxProperties.getCos();
        String key = buildKey(cos.getPrefix(), filename);
        try {
            ObjectMetadata meta = new ObjectMetadata();
            meta.setContentLength(data.length);
            if (contentType != null) {
                meta.setContentType(contentType);
            }
            PutObjectRequest req = new PutObjectRequest(
                    cos.getBucket(), key, new ByteArrayInputStream(data), meta);
            cosClient.putObject(req);
            return buildUrl(cos, key);
        } catch (Exception e) {
            log.error("COS 上传失败 key={}", key, e);
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "文件上传存储失败");
        }
    }

    /** 构造对象 key：prefix + 日期目录 + uuid + 扩展名 */
    private String buildKey(String prefix, String filename) {
        String day = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String ext = "";
        if (filename != null) {
            int dot = filename.lastIndexOf('.');
            if (dot >= 0) {
                ext = filename.substring(dot);
            }
        }
        String p = (prefix == null) ? "" : prefix;
        return p + day + "/" + UUID.randomUUID().toString().replace("-", "") + ext;
    }

    /** 拼接公网访问 URL：https://<bucket>.cos.<region>.myqcloud.com/<key> */
    private String buildUrl(ToolboxProperties.Cos cos, String key) {
        return "https://" + cos.getBucket() + ".cos." + cos.getRegion() + ".myqcloud.com/" + key;
    }
}
