package com.example.miletoolboxendproject;

import com.example.miletoolboxendproject.service.impl.PdfToolServiceImpl;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * PDF 工具真实验证（生成真实 PDF，校验合并/拆分/水印/加密）。
 * 纯逻辑测试，无需 Spring 上下文。
 */
class PdfToolServiceImplTest {

    private final PdfToolServiceImpl service = new PdfToolServiceImpl();

    /** 生成指定页数的真实 PDF 字节 */
    private byte[] makePdf(int pages) throws IOException {
        try (PDDocument doc = new PDDocument()) {
            for (int i = 0; i < pages; i++) {
                doc.addPage(new PDPage());
            }
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            doc.save(bos);
            return bos.toByteArray();
        }
    }

    private int pageCount(byte[] pdf) throws IOException {
        try (PDDocument doc = Loader.loadPDF(pdf)) {
            return doc.getNumberOfPages();
        }
    }

    @Test
    void merge_twoPdfs_pageCountIsSum() throws IOException {
        MultipartFile f1 = new MockMultipartFile("files", "a.pdf", "application/pdf", makePdf(2));
        MultipartFile f2 = new MockMultipartFile("files", "b.pdf", "application/pdf", makePdf(3));
        byte[] merged = service.merge(new MultipartFile[]{f1, f2});
        assertEquals(5, pageCount(merged), "合并后页数应为 2+3=5");
    }

    @Test
    void splitByRange_extractsCorrectPages() throws IOException {
        MultipartFile f = new MockMultipartFile("file", "src.pdf", "application/pdf", makePdf(10));
        byte[] result = service.splitByRange(f, "1-3,5,8-9");
        assertEquals(6, pageCount(result), "提取 1-3,5,8-9 应为 6 页");
    }

    @Test
    void watermark_keepsPageCount() throws IOException {
        MultipartFile f = new MockMultipartFile("file", "src.pdf", "application/pdf", makePdf(2));
        byte[] result = service.addTextWatermark(f, "CONFIDENTIAL");
        assertEquals(2, pageCount(result), "加水印不改变页数");
    }

    @Test
    void encrypt_resultIsPasswordProtected() throws IOException {
        MultipartFile f = new MockMultipartFile("file", "src.pdf", "application/pdf", makePdf(1));
        byte[] result = service.encrypt(f, "secret123");
        try (PDDocument doc = Loader.loadPDF(result, "secret123")) {
            assertTrue(doc.isEncrypted(), "加密后文档应标记为已加密");
            assertEquals(1, doc.getNumberOfPages());
        }
    }

    @Test
    void pdfToImagesZip_oneEntryPerPage() throws IOException {
        MultipartFile f = new MockMultipartFile("file", "src.pdf", "application/pdf", makePdf(3));
        byte[] zip = service.pdfToImagesZip(f, 100);

        int entries = 0;
        try (java.util.zip.ZipInputStream zis =
                     new java.util.zip.ZipInputStream(new java.io.ByteArrayInputStream(zip))) {
            while (zis.getNextEntry() != null) {
                entries++;
            }
        }
        assertEquals(3, entries, "3 页应生成 3 个 PNG");
    }

    @Test
    void imagesToPdf_onePagePerImage() throws IOException {
        byte[] png1 = makePng(120, 80);
        byte[] png2 = makePng(200, 100);
        MultipartFile i1 = new MockMultipartFile("files", "a.png", "image/png", png1);
        MultipartFile i2 = new MockMultipartFile("files", "b.png", "image/png", png2);

        byte[] pdf = service.imagesToPdf(new MultipartFile[]{i1, i2});

        assertEquals(2, pageCount(pdf), "2 张图片应生成 2 页 PDF");
    }

    /** 生成一张纯色 PNG */
    private byte[] makePng(int w, int h) throws IOException {
        java.awt.image.BufferedImage img =
                new java.awt.image.BufferedImage(w, h, java.awt.image.BufferedImage.TYPE_INT_RGB);
        java.awt.Graphics2D g = img.createGraphics();
        g.setColor(java.awt.Color.ORANGE);
        g.fillRect(0, 0, w, h);
        g.dispose();
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        javax.imageio.ImageIO.write(img, "png", bos);
        return bos.toByteArray();
    }
}
