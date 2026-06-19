package com.example.miletoolboxendproject.utils;

import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import org.springframework.web.multipart.MultipartFile;

/**
 * 文件上传校验工具。
 */
public class FileValidator {

    private FileValidator() {
    }

    /**
     * 校验文件非空
     */
    public static void requireNotEmpty(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrCode.FILE_EMPTY);
        }
    }

    /**
     * 校验多文件非空且数量在范围内
     *
     * @param files    文件数组
     * @param minCount 最少数量
     * @param maxCount 最多数量
     */
    public static void requireFiles(MultipartFile[] files, int minCount, int maxCount) {
        if (files == null || files.length < minCount) {
            throw new BusinessException(ErrCode.FILE_EMPTY, "至少需要 " + minCount + " 个文件");
        }
        if (files.length > maxCount) {
            throw new BusinessException(ErrCode.FILE_COUNT_EXCEED, "最多支持 " + maxCount + " 个文件");
        }
        for (MultipartFile file : files) {
            requireNotEmpty(file);
        }
    }

    /**
     * 校验文件扩展名（不区分大小写）
     *
     * @param file       文件
     * @param extensions 允许的扩展名（不含点，如 "pdf"）
     */
    public static void requireExtension(MultipartFile file, String... extensions) {
        requireNotEmpty(file);
        String name = file.getOriginalFilename();
        if (name == null) {
            throw new BusinessException(ErrCode.FILE_TYPE_NOT_SUPPORT);
        }
        String lower = name.toLowerCase();
        for (String ext : extensions) {
            if (lower.endsWith("." + ext.toLowerCase())) {
                return;
            }
        }
        throw new BusinessException(ErrCode.FILE_TYPE_NOT_SUPPORT,
                "仅支持以下格式：" + String.join("/", extensions));
    }

    /**
     * 批量校验扩展名
     */
    public static void requireExtension(MultipartFile[] files, String... extensions) {
        for (MultipartFile file : files) {
            requireExtension(file, extensions);
        }
    }
}
