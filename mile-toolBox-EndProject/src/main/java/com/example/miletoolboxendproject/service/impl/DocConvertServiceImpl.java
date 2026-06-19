package com.example.miletoolboxendproject.service.impl;

import com.example.miletoolboxendproject.config.ToolboxProperties;
import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.service.DocConvertService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * 文档转换服务实现（基于本机 Pandoc，临时文件方式调用）。
 * <p>支持输入 docx/md/markdown/html/htm/txt/rtf/odt/epub，输出 md/html/docx/txt。
 * <p>→PDF 需 wkhtmltopdf/LaTeX 引擎，当前不在支持列表（待服务器安装引擎后扩展）。
 */
@Slf4j
@Service
public class DocConvertServiceImpl implements DocConvertService {

    /** 允许的输入扩展名 */
    private static final Set<String> INPUT_EXT = Set.of(
            "docx", "md", "markdown", "html", "htm", "txt", "rtf", "odt", "epub");

    /** 允许的目标格式 → 输出扩展名/MIME */
    private static final Map<String, String[]> OUTPUT = Map.of(
            "md", new String[]{"md", "text/markdown"},
            "markdown", new String[]{"md", "text/markdown"},
            "html", new String[]{"html", "text/html"},
            "docx", new String[]{"docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"},
            "txt", new String[]{"txt", "text/plain"}
    );

    @Resource
    private ToolboxProperties toolboxProperties;

    @Override
    public boolean isEnabled() {
        return toolboxProperties.getPandoc().isEnabled();
    }

    @Override
    public ConvertResult convert(MultipartFile file, String targetFormat) {
        if (!isEnabled()) {
            throw new BusinessException(ErrCode.SYSTEM_ERROR, "文档转换服务未就绪（服务器未安装 Pandoc）");
        }
        if (targetFormat == null || targetFormat.isBlank()) {
            throw new BusinessException(ErrCode.PARAM_ERROR, "目标格式不能为空");
        }
        String target = targetFormat.trim().toLowerCase();
        String[] out = OUTPUT.get(target);
        if (out == null) {
            throw new BusinessException(ErrCode.PARAM_ERROR,
                    "不支持的目标格式，仅支持：md/html/docx/txt");
        }
        String inExt = inputExt(file);
        // pandoc 的 markdown 输出格式名
        String pandocTo = "md".equals(target) ? "markdown" : target;

        Path dir = null;
        try {
            dir = Files.createTempDirectory("doc-convert-");
            Path in = dir.resolve("input." + inExt);
            Path outFile = dir.resolve("output." + out[0]);
            file.transferTo(in.toFile());

            runPandoc(in.toFile(), outFile.toFile(), pandocTo);

            if (!Files.exists(outFile)) {
                throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "转换未产生结果");
            }
            byte[] data = Files.readAllBytes(outFile);
            String baseName = stripExt(file.getOriginalFilename());
            return new ConvertResult(data, baseName + "." + out[0], out[1]);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "文档转换失败：" + e.getMessage());
        } finally {
            cleanup(dir);
        }
    }

    /** 调用 pandoc：pandoc <in> -t <to> -o <out> */
    private void runPandoc(File in, File out, String to) throws Exception {
        ToolboxProperties.Pandoc cfg = toolboxProperties.getPandoc();
        ProcessBuilder pb = new ProcessBuilder(
                cfg.getPath(), in.getAbsolutePath(), "-t", to, "-o", out.getAbsolutePath());
        pb.redirectErrorStream(true);
        Process proc = pb.start();
        String output = StreamUtils.copyToString(proc.getInputStream(), java.nio.charset.StandardCharsets.UTF_8);
        boolean finished = proc.waitFor(cfg.getTimeoutSeconds(), TimeUnit.SECONDS);
        if (!finished) {
            proc.destroyForcibly();
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "转换超时");
        }
        if (proc.exitValue() != 0) {
            log.warn("pandoc 退出码 {}，输出：{}", proc.exitValue(), output);
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "转换失败（Pandoc 错误）");
        }
    }

    private String inputExt(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name == null || !name.contains(".")) {
            throw new BusinessException(ErrCode.FILE_TYPE_NOT_SUPPORT, "无法识别文件类型");
        }
        String ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
        if (!INPUT_EXT.contains(ext)) {
            throw new BusinessException(ErrCode.FILE_TYPE_NOT_SUPPORT,
                    "不支持的源文件类型：" + ext);
        }
        return ext;
    }

    private String stripExt(String name) {
        if (name == null || name.isBlank()) {
            return "converted";
        }
        int dot = name.lastIndexOf('.');
        return dot > 0 ? name.substring(0, dot) : name;
    }

    private void cleanup(Path dir) {
        if (dir == null) {
            return;
        }
        try (var stream = Files.walk(dir)) {
            stream.sorted(java.util.Comparator.reverseOrder())
                    .forEach(p -> {
                        try {
                            Files.deleteIfExists(p);
                        } catch (Exception ignored) {
                            // 忽略清理异常
                        }
                    });
        } catch (Exception ignored) {
            // 忽略清理异常
        }
    }
}
