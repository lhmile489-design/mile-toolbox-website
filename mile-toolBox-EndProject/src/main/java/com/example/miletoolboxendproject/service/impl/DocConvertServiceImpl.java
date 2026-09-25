package com.example.miletoolboxendproject.service.impl;

import com.example.miletoolboxendproject.config.ToolboxProperties;
import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.service.DocConvertService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * 文档转换服务实现（基于本机 Pandoc + LibreOffice）。
 * <p>支持输入 docx/md/markdown/html/htm/txt/rtf/odt/epub，输出 md/html/docx/txt。
 * <p>PDF 转换路径：
 *   - md/html → PDF：Pandoc → docx → LibreOffice soffice --headless --convert-to pdf
 *   - docx/odt 等 → PDF：LibreOffice soffice --headless --convert-to pdf（直接转，无需 Pandoc）
 *   - doc-to-image：→PDF（LibreOffice）→ PDFBox 渲染 PNG → ZIP
 * <p>依赖 toolbox.libreoffice.enabled=true；未就绪时抛 SYSTEM_ERROR(10010)。
 */
@Slf4j
@Service
public class DocConvertServiceImpl implements DocConvertService {

    /** 允许的通用输入扩展名 */
    private static final Set<String> INPUT_EXT = Set.of(
            "docx", "md", "markdown", "html", "htm", "txt", "rtf", "odt", "epub");

    /** 允许的 word-to-md 输入扩展名（仅 docx） */
    private static final Set<String> WORD_INPUT_EXT = Set.of("docx");

    /** 允许的 md-convert / doc-to-image 输入扩展名 */
    private static final Set<String> MD_INPUT_EXT = Set.of("md", "markdown");

    /** 允许的 doc-to-pdf / doc-to-image（非md）输入扩展名 */
    private static final Set<String> PDF_INPUT_EXT = Set.of(
            "docx", "md", "markdown", "html", "htm", "odt", "rtf", "epub");

    /**
     * LibreOffice 可直接转 PDF 的格式（无需先走 Pandoc）。
     * md/html 等文本格式通过 Pandoc 先转 docx，再由 LibreOffice 转 PDF，效果更佳。
     */
    private static final Set<String> LO_DIRECT_EXT = Set.of("docx", "odt", "rtf");

    /** 允许的目标格式 → [输出扩展名, MIME] */
    private static final Map<String, String[]> OUTPUT = Map.of(
            "md",       new String[]{"md",   "text/markdown"},
            "markdown", new String[]{"md",   "text/markdown"},
            "html",     new String[]{"html", "text/html"},
            "docx",     new String[]{"docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"},
            "txt",      new String[]{"txt",  "text/plain"},
            "pdf",      new String[]{"pdf",  "application/pdf"}
    );

    @Resource
    private ToolboxProperties toolboxProperties;

    // ====================================================================
    // 能力检查
    // ====================================================================

    @Override
    public boolean isEnabled() {
        return toolboxProperties.getPandoc().isEnabled();
    }

    @Override
    public boolean isPdfEngineEnabled() {
        return toolboxProperties.getLibreoffice().isEnabled();
    }

    // ====================================================================
    // 通用格式转换（现有 doc-convert 接口）
    // ====================================================================

    @Override
    public ConvertResult convert(MultipartFile file, String targetFormat) {
        requirePandoc();
        if (targetFormat == null || targetFormat.isBlank()) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "目标格式不能为空");
        }
        String target = targetFormat.trim().toLowerCase();
        String[] out = OUTPUT.get(target);
        if (out == null || "pdf".equals(target)) {
            throw new BusinessException(ErrCode.PARAM_ERROR,
                    "不支持的目标格式，仅支持：md/html/docx/txt");
        }
        String inExt = resolveInputExt(file, INPUT_EXT);
        String pandocTo = "md".equals(target) ? "markdown" : target;
        return runConvert(file, inExt, pandocTo, out[0], out[1], null);
    }

    // ====================================================================
    // word-to-md
    // ====================================================================

    @Override
    public ConvertResult wordToMarkdown(MultipartFile file) {
        requirePandoc();
        resolveInputExt(file, WORD_INPUT_EXT);  // 校验仅 docx
        return runConvert(file, "docx", "markdown", "md", "text/markdown", null);
    }

    // ====================================================================
    // md-convert（Markdown → docx/html/pdf）
    // ====================================================================

    @Override
    public ConvertResult markdownExport(MultipartFile file, String format) {
        requirePandoc();
        if (format == null || format.isBlank()) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "目标格式不能为空");
        }
        String fmt = format.trim().toLowerCase();
        if (!Set.of("docx", "html", "pdf").contains(fmt)) {
            throw new BusinessException(ErrCode.PARAM_ERROR,
                    "目标格式不支持，仅允许：docx / html / pdf");
        }
        if ("pdf".equals(fmt)) {
            requirePdfEngine();
            // md → pdf：先 Pandoc 转 docx，再 LibreOffice 转 PDF
            return convertToPdfViaLibreOffice(file, "md");
        }
        resolveInputExt(file, MD_INPUT_EXT);
        String[] out = OUTPUT.get(fmt);
        return runConvert(file, "md", fmt, out[0], out[1], null);
    }

    // ====================================================================
    // doc-to-pdf
    // ====================================================================

    @Override
    public ConvertResult docToPdf(MultipartFile file) {
        requirePdfEngine();
        String inExt = resolveInputExt(file, PDF_INPUT_EXT);
        return convertToPdfViaLibreOffice(file, inExt);
    }

    // ====================================================================
    // doc-to-image（→ PDF → PDFBox 渲染 PNG → ZIP）
    // ====================================================================

    @Override
    public ConvertResult docToImage(MultipartFile file, int dpi) {
        requirePdfEngine();
        int safeDpi = Math.max(72, Math.min(dpi, 300));
        String inExt = resolveInputExt(file, PDF_INPUT_EXT);

        Path dir = null;
        try {
            dir = Files.createTempDirectory("doc-to-image-");

            // 1. → PDF（LibreOffice 路径）
            Path pdfPath = convertToPdfFile(file, inExt, dir);
            if (!Files.exists(pdfPath)) {
                throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "PDF 中间转换未产生结果");
            }

            // 2. PDFBox 渲染每页为 PNG
            String baseName = stripExt(file.getOriginalFilename());
            ByteArrayOutputStream zipBuf = new ByteArrayOutputStream();
            try (PDDocument doc = Loader.loadPDF(pdfPath.toFile());
                 ZipOutputStream zos = new ZipOutputStream(zipBuf)) {

                PDFRenderer renderer = new PDFRenderer(doc);
                int totalPages = doc.getNumberOfPages();
                for (int i = 0; i < totalPages; i++) {
                    BufferedImage img = renderer.renderImageWithDPI(i, safeDpi, ImageType.RGB);
                    ByteArrayOutputStream pngBuf = new ByteArrayOutputStream();
                    ImageIO.write(img, "PNG", pngBuf);
                    String entryName = baseName + "_page" + String.format("%03d", i + 1) + ".png";
                    zos.putNextEntry(new ZipEntry(entryName));
                    zos.write(pngBuf.toByteArray());
                    zos.closeEntry();
                }
            }

            return new ConvertResult(zipBuf.toByteArray(),
                    baseName + "_images.zip", "application/zip");

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("doc-to-image 失败", e);
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "文档转图片失败：" + e.getMessage());
        } finally {
            cleanup(dir);
        }
    }

    // ====================================================================
    // 内部工具：LibreOffice PDF 转换
    // ====================================================================

    /**
     * 通用文档 → PDF（ConvertResult），供 docToPdf / markdownExport(pdf) 使用。
     * 路径：
     *   - docx/odt/rtf：LibreOffice 直接转 PDF
     *   - md/html/epub 等：先 Pandoc → docx，再 LibreOffice → PDF
     */
    private ConvertResult convertToPdfViaLibreOffice(MultipartFile file, String inExt) {
        Path dir = null;
        try {
            dir = Files.createTempDirectory("doc-to-pdf-");
            Path pdfPath = convertToPdfFile(file, inExt, dir);
            if (!Files.exists(pdfPath)) {
                throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "转换未产生 PDF 结果");
            }
            byte[] data = Files.readAllBytes(pdfPath);
            String baseName = stripExt(file.getOriginalFilename());
            return new ConvertResult(data, baseName + ".pdf", "application/pdf");
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("doc-to-pdf 失败 inExt={}", inExt, e);
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "转换 PDF 失败：" + e.getMessage());
        } finally {
            cleanup(dir);
        }
    }

    /**
     * 核心：将 MultipartFile 转为 PDF 文件，返回 PDF 路径。
     * 供 docToPdf / docToImage 复用。
     *
     * @param file  源文件
     * @param inExt 已解析的输入扩展名
     * @param dir   临时工作目录（由调用方管理生命周期）
     * @return PDF 文件路径
     */
    private Path convertToPdfFile(MultipartFile file, String inExt, Path dir) throws Exception {
        Path inPath = dir.resolve("input." + inExt);
        file.transferTo(inPath.toFile());

        Path docxPath;
        if (LO_DIRECT_EXT.contains(inExt)) {
            // docx/odt/rtf：LibreOffice 直接转 PDF
            docxPath = inPath;
        } else {
            // md/html/htm/epub/txt → 先 Pandoc 转 docx，再交给 LibreOffice
            requirePandoc();
            docxPath = dir.resolve("intermediate.docx");
            runPandoc(inPath.toFile(), docxPath.toFile(), "docx", null);
            if (!Files.exists(docxPath)) {
                throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "Pandoc 中间转换 docx 失败");
            }
        }

        // LibreOffice --headless --convert-to pdf
        Path pdfPath = dir.resolve("output.pdf");
        runLibreOffice(docxPath.toFile(), dir.toFile());

        // LibreOffice 输出文件名 = 输入文件名改扩展名为 .pdf
        String loOutput = docxPath.getFileName().toString()
                .replaceAll("\\.[^.]+$", ".pdf");
        Path loOutputPath = dir.resolve(loOutput);
        if (Files.exists(loOutputPath) && !loOutputPath.equals(pdfPath)) {
            Files.move(loOutputPath, pdfPath);
        }
        return pdfPath;
    }

    // ====================================================================
    // 内部工具：Pandoc / LibreOffice 进程调用
    // ====================================================================

    /**
     * 核心转换方法：Pandoc 单次调用（非 PDF 场景）。
     */
    private ConvertResult runConvert(MultipartFile file, String inExt,
                                     String pandocTo, String outExt, String mime,
                                     String[] extraArgs) {
        Path dir = null;
        try {
            dir = Files.createTempDirectory("doc-convert-");
            Path in = dir.resolve("input." + inExt);
            Path outFile = dir.resolve("output." + outExt);
            file.transferTo(in.toFile());

            runPandoc(in.toFile(), outFile.toFile(), pandocTo, extraArgs);

            if (!Files.exists(outFile)) {
                throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "转换未产生结果");
            }
            byte[] data = Files.readAllBytes(outFile);
            String baseName = stripExt(file.getOriginalFilename());
            return new ConvertResult(data, baseName + "." + outExt, mime);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("文档转换失败 pandocTo={}", pandocTo, e);
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "文档转换失败：" + e.getMessage());
        } finally {
            cleanup(dir);
        }
    }

    /** 调用 Pandoc 进程（支持附加参数）。 */
    private void runPandoc(File in, File out, String to, String[] extraArgs) throws Exception {
        ToolboxProperties.Pandoc cfg = toolboxProperties.getPandoc();

        java.util.List<String> cmd = new java.util.ArrayList<>();
        cmd.add(cfg.getPath());
        cmd.add(in.getAbsolutePath());
        cmd.add("-t"); cmd.add(to);
        cmd.add("-o"); cmd.add(out.getAbsolutePath());
        if (extraArgs != null) {
            for (String arg : extraArgs) cmd.add(arg);
        }

        runProcess(cmd, cfg.getTimeoutSeconds(), "Pandoc");
    }

    /**
     * 调用 LibreOffice soffice --headless 将文件转为 PDF，输出到 outDir。
     * LibreOffice 固定把结果输出到 --outdir 目录，文件名 = 原文件名改扩展名 .pdf。
     */
    private void runLibreOffice(File in, File outDir) throws Exception {
        ToolboxProperties.LibreOffice cfg = toolboxProperties.getLibreoffice();

        java.util.List<String> cmd = new java.util.ArrayList<>();
        cmd.add(cfg.getPath());
        cmd.add("--headless");
        cmd.add("--convert-to"); cmd.add("pdf");
        cmd.add("--outdir"); cmd.add(outDir.getAbsolutePath());
        cmd.add(in.getAbsolutePath());

        runProcess(cmd, cfg.getTimeoutSeconds(), "LibreOffice");
    }

    /** 通用进程执行（等待超时，收集 stdout/stderr）。 */
    private void runProcess(java.util.List<String> cmd, int timeoutSeconds, String toolName)
            throws Exception {
        log.debug("{} 命令：{}", toolName, String.join(" ", cmd));
        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.redirectErrorStream(true);
        Process proc = pb.start();
        String output = StreamUtils.copyToString(proc.getInputStream(),
                java.nio.charset.StandardCharsets.UTF_8);
        boolean finished = proc.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        if (!finished) {
            proc.destroyForcibly();
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED,
                    toolName + " 转换超时（" + timeoutSeconds + "s）");
        }
        if (proc.exitValue() != 0) {
            log.warn("{} 退出码 {}，输出：{}", toolName, proc.exitValue(), output);
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED,
                    toolName + " 转换失败（退出码 " + proc.exitValue() + "）");
        }
    }

    // ====================================================================
    // 内部工具：文件/路径处理
    // ====================================================================

    /** 解析并校验输入文件扩展名。 */
    private String resolveInputExt(MultipartFile file, Set<String> allowed) {
        String name = file.getOriginalFilename();
        if (name == null || !name.contains(".")) {
            throw new BusinessException(ErrCode.FILE_TYPE_NOT_SUPPORT, "无法识别文件类型");
        }
        String ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
        if (!allowed.contains(ext)) {
            throw new BusinessException(ErrCode.FILE_TYPE_NOT_SUPPORT,
                    "不支持的源文件类型：" + ext + "，仅支持：" + String.join("/", allowed));
        }
        return ext;
    }

    /** 去除文件名扩展名。 */
    private String stripExt(String name) {
        if (name == null || name.isBlank()) return "converted";
        int dot = name.lastIndexOf('.');
        return dot > 0 ? name.substring(0, dot) : name;
    }

    /** 递归清理临时目录。 */
    private void cleanup(Path dir) {
        if (dir == null) return;
        try (var stream = Files.walk(dir)) {
            stream.sorted(Comparator.reverseOrder())
                    .forEach(p -> {
                        try { Files.deleteIfExists(p); } catch (Exception ignored) {}
                    });
        } catch (Exception ignored) {}
    }

    /** 校验 Pandoc 可用，否则抛 SYSTEM_ERROR(10010)。 */
    private void requirePandoc() {
        if (!isEnabled()) {
            throw new BusinessException(ErrCode.SYSTEM_ERROR, "文档转换服务未就绪（服务器未安装 Pandoc）");
        }
    }

    /** 校验 LibreOffice 可用，否则抛 SYSTEM_ERROR(10010)。 */
    private void requirePdfEngine() {
        if (!isPdfEngineEnabled()) {
            throw new BusinessException(ErrCode.SYSTEM_ERROR,
                    "文档转PDF服务未就绪，需服务器安装 LibreOffice 并配置 toolbox.libreoffice.enabled=true");
        }
    }
}
