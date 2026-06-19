package com.example.miletoolboxendproject;

import com.example.miletoolboxendproject.service.impl.ImageToolServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 图片转换真实验证（生成真实图片，校验转换后可解码且尺寸保持）。
 */
class ImageToolServiceImplTest {

    private final ImageToolServiceImpl service = new ImageToolServiceImpl();

    private byte[] makeImage(int w, int h, String format, boolean alpha) throws IOException {
        BufferedImage img = new BufferedImage(w, h,
                alpha ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setColor(Color.ORANGE);
        g.fillRect(0, 0, w, h);
        g.dispose();
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ImageIO.write(img, format, bos);
        return bos.toByteArray();
    }

    @Test
    void convert_pngToJpg_decodableAndSameSize() throws IOException {
        MultipartFile f = new MockMultipartFile("file", "a.png", "image/png", makeImage(160, 90, "png", false));

        byte[] out = service.convert(f, "jpg", 0.8f);

        BufferedImage result = ImageIO.read(new ByteArrayInputStream(out));
        assertNotNull(result, "转换结果应可解码");
        assertEquals(160, result.getWidth());
        assertEquals(90, result.getHeight());
    }

    @Test
    void convert_pngWithAlphaToJpg_noError() throws IOException {
        MultipartFile f = new MockMultipartFile("file", "a.png", "image/png", makeImage(100, 100, "png", true));

        byte[] out = service.convert(f, "jpeg", null);

        assertNotNull(ImageIO.read(new ByteArrayInputStream(out)), "含透明通道转 jpg 应正常铺白底");
    }

    @Test
    void convert_jpgToPng_decodable() throws IOException {
        MultipartFile f = new MockMultipartFile("file", "a.jpg", "image/jpeg", makeImage(120, 80, "jpg", false));

        byte[] out = service.convert(f, "png", null);

        assertTrue(out.length > 0);
        assertNotNull(ImageIO.read(new ByteArrayInputStream(out)));
    }
}
