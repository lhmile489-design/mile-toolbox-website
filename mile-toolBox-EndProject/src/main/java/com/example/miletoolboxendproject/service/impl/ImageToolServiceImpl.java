package com.example.miletoolboxendproject.service.impl;

import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.service.ImageToolService;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Set;

/**
 * 图片处理服务实现（Thumbnailator + ImageIO，TwelveMonkeys 拓宽读取格式）。
 */
@Service
public class ImageToolServiceImpl implements ImageToolService {

    /** 支持的输出格式（ImageIO 内置 writer） */
    private static final Set<String> OUTPUT_FORMATS = Set.of("png", "jpg", "jpeg", "bmp", "gif");

    @Override
    public byte[] convert(MultipartFile file, String targetFormat, Float quality) {
        if (targetFormat == null || targetFormat.isBlank()) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "目标格式不能为空");
        }
        String fmt = targetFormat.trim().toLowerCase();
        if (!OUTPUT_FORMATS.contains(fmt)) {
            throw new BusinessException(ErrCode.PARAM_ERROR,
                    "不支持的目标格式，仅支持：" + String.join("/", OUTPUT_FORMATS));
        }
        float q = quality == null ? 0.9f : Math.min(Math.max(quality, 0.1f), 1.0f);
        boolean isJpeg = "jpg".equals(fmt) || "jpeg".equals(fmt);

        try {
            BufferedImage src = ImageIO.read(new ByteArrayInputStream(file.getBytes()));
            if (src == null) {
                throw new BusinessException(ErrCode.FILE_TYPE_NOT_SUPPORT, "无法识别的图片格式");
            }
            // JPEG 不支持透明通道：含 alpha 时铺白底，避免变色/黑底
            BufferedImage toWrite = src;
            if (isJpeg && src.getColorModel().hasAlpha()) {
                BufferedImage rgb = new BufferedImage(src.getWidth(), src.getHeight(), BufferedImage.TYPE_INT_RGB);
                rgb.createGraphics().drawImage(src, 0, 0, java.awt.Color.WHITE, null);
                toWrite = rgb;
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Thumbnails.of(toWrite)
                    .scale(1.0)                       // 保持原尺寸，仅转格式
                    .outputFormat(isJpeg ? "jpg" : fmt)
                    .outputQuality(q)
                    .toOutputStream(out);
            return out.toByteArray();
        } catch (BusinessException e) {
            throw e;
        } catch (IOException e) {
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "图片转换失败：" + e.getMessage());
        }
    }
}
