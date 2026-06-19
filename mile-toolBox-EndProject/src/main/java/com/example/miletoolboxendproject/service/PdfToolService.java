package com.example.miletoolboxendproject.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * PDF 文件处理服务。
 */
public interface PdfToolService {

    /**
     * 合并多个 PDF 为一个
     *
     * @param files PDF 文件数组（顺序即合并顺序）
     * @return 合并后的 PDF 字节
     */
    byte[] merge(MultipartFile[] files);

    /**
     * 按页码范围从 PDF 提取页面生成新 PDF
     *
     * @param file  源 PDF
     * @param range 页码范围表达式（1-based，如 "1-3,5,8-10"）
     * @return 提取后的 PDF 字节
     */
    byte[] splitByRange(MultipartFile file, String range);

    /**
     * 为 PDF 每页添加对角线文字水印（当前支持拉丁字母/数字；中文需服务器内置 CJK 字体）
     *
     * @param file 源 PDF
     * @param text 水印文字
     * @return 加水印后的 PDF 字节
     */
    byte[] addTextWatermark(MultipartFile file, String text);

    /**
     * 用密码加密 PDF（设置打开密码）
     *
     * @param file     源 PDF
     * @param password 打开密码（用户密码）
     * @return 加密后的 PDF 字节
     */
    byte[] encrypt(MultipartFile file, String password);

    /**
     * PDF 转图片：逐页渲染为 PNG，打包为 ZIP
     *
     * @param file 源 PDF
     * @param dpi  渲染分辨率（72~300，默认 150）
     * @return ZIP 字节（含 page-1.png, page-2.png ...）
     */
    byte[] pdfToImagesZip(MultipartFile file, int dpi);

    /**
     * 图片转 PDF：多张图片合成一个 PDF（每图一页）
     *
     * @param files 图片文件数组（png/jpg/jpeg）
     * @return 合成的 PDF 字节
     */
    byte[] imagesToPdf(MultipartFile[] files);
}
