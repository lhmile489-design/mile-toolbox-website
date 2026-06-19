package com.example.miletoolboxendproject;

import com.example.miletoolboxendproject.config.ToolboxProperties;
import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.service.DocConvertService;
import com.example.miletoolboxendproject.service.impl.DocConvertServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.File;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * DocConvertServiceImpl 单测。
 * <p>真实调用 Pandoc 的用例用 {@link EnabledIf} 守卫：仅当本机存在 pandoc 时运行，
 * 否则跳过（CI/无 Pandoc 环境不失败）。
 */
class DocConvertServiceImplTest {

    private DocConvertServiceImpl service;
    private ToolboxProperties props;

    /** 探测本机 pandoc 路径；找不到返回 null */
    static String pandocPath() {
        String[] candidates = {
                "C:\\Program Files\\Pandoc\\pandoc.exe",
                "/usr/bin/pandoc",
                "/usr/local/bin/pandoc"
        };
        for (String c : candidates) {
            if (new File(c).exists()) {
                return c;
            }
        }
        return null;
    }

    static boolean pandocAvailable() {
        return pandocPath() != null;
    }

    @BeforeEach
    void setUp() {
        service = new DocConvertServiceImpl();
        props = new ToolboxProperties();
        ToolboxProperties.Pandoc p = props.getPandoc();
        p.setEnabled(true);
        String path = pandocPath();
        if (path != null) {
            p.setPath(path);
        }
        ReflectionTestUtils.setField(service, "toolboxProperties", props);
    }

    @Test
    void convert_unsupportedFormat_throws() {
        MockMultipartFile f = new MockMultipartFile("file", "a.md", "text/markdown",
                "# x".getBytes(StandardCharsets.UTF_8));
        BusinessException e = assertThrows(BusinessException.class, () -> service.convert(f, "pdf"));
        assertEquals("10001", e.getCode());
    }

    @Test
    void convert_disabled_throws() {
        props.getPandoc().setEnabled(false);
        MockMultipartFile f = new MockMultipartFile("file", "a.md", "text/markdown",
                "# x".getBytes(StandardCharsets.UTF_8));
        BusinessException e = assertThrows(BusinessException.class, () -> service.convert(f, "html"));
        assertEquals("10010", e.getCode());
    }

    @Test
    @EnabledIf("pandocAvailable")
    void convert_mdToHtml_realPandoc() {
        MockMultipartFile f = new MockMultipartFile("file", "doc.md", "text/markdown",
                "# Hello\n\nThis is **bold**.".getBytes(StandardCharsets.UTF_8));
        DocConvertService.ConvertResult r = service.convert(f, "html");
        String html = new String(r.data(), StandardCharsets.UTF_8);
        assertTrue(html.contains("<h1"), "应含 h1 标题");
        assertTrue(html.contains("<strong>bold</strong>"), "粗体应转为 strong");
        assertEquals("doc.html", r.filename());
    }

    @Test
    @EnabledIf("pandocAvailable")
    void convert_docxToMd_realPandoc() {
        // 先用 pandoc 把 md 转成 docx 作为输入素材，再 docx->md（核心：doc 转 MD）
        MockMultipartFile mdFile = new MockMultipartFile("file", "src.md", "text/markdown",
                "# Title\n\n- a\n- b".getBytes(StandardCharsets.UTF_8));
        DocConvertService.ConvertResult docx = service.convert(mdFile, "docx");
        assertEquals("src.docx", docx.filename());

        MockMultipartFile docxFile = new MockMultipartFile("file", "src.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document", docx.data());
        DocConvertService.ConvertResult md = service.convert(docxFile, "md");
        String text = new String(md.data(), StandardCharsets.UTF_8);
        assertTrue(text.contains("Title"), "应还原标题文本");
        assertEquals("src.md", md.filename());
    }
}
