package com.example.miletoolboxendproject.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 文件处理结果（上传 COS 后返回 URL 的形态）。
 */
@Data
public class FileResultVO implements Serializable {

    /** 产物可访问 URL */
    private String url;

    /** 文件名 */
    private String filename;

    /** 字节大小 */
    private long size;

    public FileResultVO(String url, String filename, long size) {
        this.url = url;
        this.filename = filename;
        this.size = size;
    }
}
