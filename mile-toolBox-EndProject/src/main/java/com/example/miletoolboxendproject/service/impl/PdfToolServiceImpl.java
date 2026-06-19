package com.example.miletoolboxendproject.service.impl;

import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.service.PdfToolService;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.io.IOUtils;
import org.apache.pdfbox.io.RandomAccessReadBuffer;
import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.encryption.AccessPermission;
import org.apache.pdfbox.pdmodel.encryption.StandardProtectionPolicy;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.pdmodel.graphics.state.PDExtendedGraphicsState;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.util.Matrix;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * PDF 文件处理服务实现（基于 Apache PDFBox）。
 */
@Service
public class PdfToolServiceImpl implements PdfToolService {

    @Override
    public byte[] merge(MultipartFile[] files) {
        try {
            PDFMergerUtility merger = new PDFMergerUtility();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            merger.setDestinationStream(out);
            for (MultipartFile file : files) {
                merger.addSource(new RandomAccessReadBuffer(file.getBytes()));
            }
            merger.mergeDocuments(IOUtils.createMemoryOnlyStreamCache());
            return out.toByteArray();
        } catch (IOException e) {
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "PDF 合并失败：" + e.getMessage());
        }
    }

    @Override
    public byte[] splitByRange(MultipartFile file, String range) {
        try (PDDocument source = Loader.loadPDF(file.getBytes())) {
            int totalPages = source.getNumberOfPages();
            List<Integer> pages = parseRange(range, totalPages);
            try (PDDocument target = new PDDocument()) {
                for (int pageNo : pages) {
                    // pageNo 为 1-based，getPage 为 0-based
                    target.addPage(source.getPage(pageNo - 1));
                }
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                target.save(out);
                return out.toByteArray();
            }
        } catch (IOException e) {
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "PDF 拆分失败：" + e.getMessage());
        }
    }

    /**
     * 解析页码范围表达式（1-based），返回有序去重的页码列表。
     * <p>支持 "1-3,5,8-10" 形式；超出文档页数或格式非法抛业务异常。
     *
     * @param range      范围表达式
     * @param totalPages 文档总页数
     */
    private List<Integer> parseRange(String range, int totalPages) {
        if (range == null || range.isBlank()) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "页码范围不能为空");
        }
        Set<Integer> result = new LinkedHashSet<>();
        String[] parts = range.split(",");
        for (String part : parts) {
            String token = part.trim();
            if (token.isEmpty()) {
                continue;
            }
            try {
                if (token.contains("-")) {
                    String[] bounds = token.split("-", 2);
                    int start = Integer.parseInt(bounds[0].trim());
                    int end = Integer.parseInt(bounds[1].trim());
                    if (start > end) {
                        int tmp = start;
                        start = end;
                        end = tmp;
                    }
                    validatePage(start, totalPages);
                    validatePage(end, totalPages);
                    for (int i = start; i <= end; i++) {
                        result.add(i);
                    }
                } else {
                    int page = Integer.parseInt(token);
                    validatePage(page, totalPages);
                    result.add(page);
                }
            } catch (NumberFormatException e) {
                throw new BusinessException(ErrCode.PARAM_ERROR, "页码范围格式错误：" + token);
            }
        }
        if (result.isEmpty()) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "未指定有效页码");
        }
        return new ArrayList<>(result);
    }

    private void validatePage(int page, int totalPages) {
        if (page < 1 || page > totalPages) {
            throw new BusinessException(ErrCode.PARAM_ERROR,
                    "页码 " + page + " 超出范围（文档共 " + totalPages + " 页）");
        }
    }

    @Override
    public byte[] addTextWatermark(MultipartFile file, String text) {
        if (text == null || text.isBlank()) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "水印文字不能为空");
        }
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            PDFont font = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            float fontSize = 48f;
            float textWidth;
            try {
                textWidth = font.getStringWidth(text) / 1000f * fontSize;
            } catch (IllegalArgumentException e) {
                // Helvetica 无法编码（如中文）时给出明确提示
                throw new BusinessException(ErrCode.PARAM_ERROR,
                        "水印暂仅支持英文/数字，中文水印需服务器内置 CJK 字体");
            }
            for (PDPage page : doc.getPages()) {
                PDRectangle box = page.getMediaBox();
                try (PDPageContentStream cs = new PDPageContentStream(
                        doc, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    PDExtendedGraphicsState gs = new PDExtendedGraphicsState();
                    gs.setNonStrokingAlphaConstant(0.20f);
                    cs.setGraphicsStateParameters(gs);
                    cs.setNonStrokingColor(0.5f, 0.5f, 0.5f);
                    cs.beginText();
                    cs.setFont(font, fontSize);
                    // 以页面中心为锚点旋转 45°，并左移半个文字宽度使其大致居中
                    float cx = box.getWidth() / 2f;
                    float cy = box.getHeight() / 2f;
                    Matrix matrix = Matrix.getRotateInstance(Math.toRadians(45), cx, cy);
                    matrix.translate(-textWidth / 2f, 0);
                    cs.setTextMatrix(matrix);
                    cs.showText(text);
                    cs.endText();
                }
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "PDF 加水印失败：" + e.getMessage());
        }
    }

    @Override
    public byte[] encrypt(MultipartFile file, String password) {
        if (password == null || password.isBlank()) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "密码不能为空");
        }
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            AccessPermission ap = new AccessPermission();
            // 用户密码与所有者密码一致：仅设置打开密码
            StandardProtectionPolicy spp = new StandardProtectionPolicy(password, password, ap);
            spp.setEncryptionKeyLength(128);
            spp.setPermissions(ap);
            doc.protect(spp);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "PDF 加密失败：" + e.getMessage());
        }
    }

    @Override
    public byte[] pdfToImagesZip(MultipartFile file, int dpi) {
        int safeDpi = Math.min(Math.max(dpi, 72), 300);
        try (PDDocument doc = Loader.loadPDF(file.getBytes());
             ByteArrayOutputStream zipBytes = new ByteArrayOutputStream();
             ZipOutputStream zip = new ZipOutputStream(zipBytes)) {
            PDFRenderer renderer = new PDFRenderer(doc);
            int pages = doc.getNumberOfPages();
            for (int i = 0; i < pages; i++) {
                BufferedImage image = renderer.renderImageWithDPI(i, safeDpi, ImageType.RGB);
                ByteArrayOutputStream pngOut = new ByteArrayOutputStream();
                ImageIO.write(image, "png", pngOut);
                zip.putNextEntry(new ZipEntry("page-" + (i + 1) + ".png"));
                zip.write(pngOut.toByteArray());
                zip.closeEntry();
            }
            zip.finish();
            return zipBytes.toByteArray();
        } catch (IOException e) {
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "PDF 转图片失败：" + e.getMessage());
        }
    }

    @Override
    public byte[] imagesToPdf(MultipartFile[] files) {
        try (PDDocument doc = new PDDocument()) {
            for (MultipartFile file : files) {
                byte[] bytes = file.getBytes();
                PDImageXObject image = PDImageXObject.createFromByteArray(
                        doc, bytes, file.getOriginalFilename());
                // 页面尺寸与图片像素一致（点≈像素，简单稳妥）
                PDPage page = new PDPage(new PDRectangle(image.getWidth(), image.getHeight()));
                doc.addPage(page);
                try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                    cs.drawImage(image, 0, 0, image.getWidth(), image.getHeight());
                }
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "图片转 PDF 失败：" + e.getMessage());
        }
    }
}
