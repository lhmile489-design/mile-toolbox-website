package com.example.miletoolboxendproject.service.impl;

import com.example.miletoolboxendproject.config.ToolboxProperties;
import com.example.miletoolboxendproject.exception.BusinessException;
import com.example.miletoolboxendproject.exception.ErrCode;
import com.example.miletoolboxendproject.filetask.FileTaskResult;
import com.example.miletoolboxendproject.service.AsyncFileTaskService;
import com.example.miletoolboxendproject.service.MediaService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * 媒体处理服务实现（基于 FFmpeg 异步任务）。
 * <p>所有操作提交后立即返回 taskId，实际转码在后台线程池执行。
 * <p>前端通过 GET /task/{taskId} 轮询状态与进度。
 */
@Slf4j
@Service
public class MediaServiceImpl implements MediaService {

    /** 视频输入扩展名 */
    private static final Set<String> VIDEO_EXT = Set.of("mp4", "avi", "mov", "mkv", "webm");

    /** 音频输入扩展名 */
    private static final Set<String> AUDIO_EXT = Set.of("mp3", "wav", "aac", "flac", "ogg");

    /** 视频输出格式 */
    private static final Set<String> VIDEO_OUT = Set.of("mp4", "avi", "mov", "mkv", "webm");

    /** 音频输出格式 */
    private static final Set<String> AUDIO_OUT = Set.of("mp3", "wav", "aac", "flac", "ogg");

    /** 压缩质量 → CRF 值（H.264：越小质量越高） */
    private static final Map<String, String> QUALITY_CRF = Map.of(
            "high",   "23",
            "medium", "28",
            "low",    "35"
    );

    /** 分辨率 → vf scale 参数（-2 保持宽高比） */
    private static final Map<String, String> RESOLUTION_VF = Map.of(
            "1080p", "scale=-2:1080",
            "720p",  "scale=-2:720",
            "480p",  "scale=-2:480"
    );

    /** 音频格式 → FFmpeg 编码器 */
    private static final Map<String, String> AUDIO_CODEC = Map.of(
            "mp3",  "libmp3lame",
            "aac",  "aac",
            "wav",  "pcm_s16le",
            "flac", "flac",
            "ogg",  "libvorbis"
    );

    /** 视频格式 → MIME */
    private static final Map<String, String> VIDEO_MIME = Map.of(
            "mp4",  "video/mp4",
            "avi",  "video/x-msvideo",
            "mov",  "video/quicktime",
            "mkv",  "video/x-matroska",
            "webm", "video/webm"
    );

    /** 音频格式 → MIME */
    private static final Map<String, String> AUDIO_MIME = Map.of(
            "mp3",  "audio/mpeg",
            "aac",  "audio/aac",
            "wav",  "audio/wav",
            "flac", "audio/flac",
            "ogg",  "audio/ogg"
    );

    @Resource
    private ToolboxProperties toolboxProperties;

    @Resource
    private AsyncFileTaskService asyncFileTaskService;

    // ====================================================================
    // 能力检查
    // ====================================================================

    @Override
    public boolean isEnabled() {
        return toolboxProperties.getFfmpeg().isEnabled();
    }

    private void requireFfmpeg() {
        if (!isEnabled()) {
            throw new BusinessException(ErrCode.SYSTEM_ERROR,
                    "媒体处理服务未就绪（服务器未安装 FFmpeg 或未配置 toolbox.ffmpeg.enabled=true）");
        }
    }

    // ====================================================================
    // 视频压缩
    // ====================================================================

    @Override
    public String compressVideo(MultipartFile file, String quality, String resolution,
                                Long userId, String clientIp) {
        requireFfmpeg();
        String inExt = resolveExt(file, VIDEO_EXT);
        String safeQuality = (quality == null || !QUALITY_CRF.containsKey(quality)) ? "medium" : quality;
        String safeRes = (resolution == null || (!RESOLUTION_VF.containsKey(resolution) && !"original".equals(resolution)))
                ? "original" : resolution;
        String baseName = stripExt(file.getOriginalFilename());

        // 保存文件到临时目录（异步任务中需要文件内容，MultipartFile 不能跨线程）
        byte[] fileBytes = readBytes(file);

        return asyncFileTaskService.submit(
                "video-compress", file.getOriginalFilename(), file.getSize(), 1,
                userId, clientIp,
                (progress) -> {
                    Path dir = Files.createTempDirectory("media-compress-");
                    try {
                        Path inPath = dir.resolve("input." + inExt);
                        Path outPath = dir.resolve("output.mp4");
                        Files.write(inPath, fileBytes);
                        progress.report(5);

                        List<String> cmd = new ArrayList<>();
                        cmd.add(toolboxProperties.getFfmpeg().getPath());
                        cmd.add("-i"); cmd.add(inPath.toAbsolutePath().toString());
                        cmd.add("-crf"); cmd.add(QUALITY_CRF.get(safeQuality));
                        cmd.add("-preset"); cmd.add("medium");
                        if (RESOLUTION_VF.containsKey(safeRes)) {
                            cmd.add("-vf"); cmd.add(RESOLUTION_VF.get(safeRes));
                        }
                        cmd.add("-c:a"); cmd.add("copy");
                        cmd.add("-y");
                        cmd.add(outPath.toAbsolutePath().toString());

                        runFfmpeg(cmd, progress, 10, 90);

                        byte[] result = Files.readAllBytes(outPath);
                        progress.report(100);
                        return new FileTaskResult(result, baseName + "_compressed.mp4", "video/mp4");
                    } finally {
                        cleanup(dir);
                    }
                }
        );
    }

    // ====================================================================
    // 视频格式转换
    // ====================================================================

    @Override
    public String convertVideo(MultipartFile file, String format, Long userId, String clientIp) {
        requireFfmpeg();
        String inExt = resolveExt(file, VIDEO_EXT);
        if (format == null || !VIDEO_OUT.contains(format.toLowerCase())) {
            throw new BusinessException(ErrCode.PARAM_ERROR,
                    "不支持的目标格式，仅支持：" + String.join("/", VIDEO_OUT));
        }
        String outFmt = format.toLowerCase();
        String baseName = stripExt(file.getOriginalFilename());
        byte[] fileBytes = readBytes(file);

        return asyncFileTaskService.submit(
                "video-convert", file.getOriginalFilename(), file.getSize(), 1,
                userId, clientIp,
                (progress) -> {
                    Path dir = Files.createTempDirectory("media-convert-video-");
                    try {
                        Path inPath = dir.resolve("input." + inExt);
                        Path outPath = dir.resolve("output." + outFmt);
                        Files.write(inPath, fileBytes);
                        progress.report(5);

                        List<String> cmd = new ArrayList<>();
                        cmd.add(toolboxProperties.getFfmpeg().getPath());
                        cmd.add("-i"); cmd.add(inPath.toAbsolutePath().toString());
                        // mp4/mkv/webm 使用 H.264+aac；其他格式自动选编码器
                        if ("mp4".equals(outFmt) || "mkv".equals(outFmt)) {
                            cmd.add("-c:v"); cmd.add("libx264");
                            cmd.add("-c:a"); cmd.add("aac");
                        } else if ("webm".equals(outFmt)) {
                            cmd.add("-c:v"); cmd.add("libvpx-vp9");
                            cmd.add("-c:a"); cmd.add("libvorbis");
                        }
                        cmd.add("-y");
                        cmd.add(outPath.toAbsolutePath().toString());

                        runFfmpeg(cmd, progress, 10, 90);

                        byte[] result = Files.readAllBytes(outPath);
                        progress.report(100);
                        String mime = VIDEO_MIME.getOrDefault(outFmt, "video/mp4");
                        return new FileTaskResult(result, baseName + "." + outFmt, mime);
                    } finally {
                        cleanup(dir);
                    }
                }
        );
    }

    // ====================================================================
    // 提取音频
    // ====================================================================

    @Override
    public String extractAudio(MultipartFile file, String format, Long userId, String clientIp) {
        requireFfmpeg();
        String inExt = resolveExt(file, VIDEO_EXT);
        String outFmt = (format == null || !Set.of("mp3", "aac", "wav").contains(format.toLowerCase()))
                ? "mp3" : format.toLowerCase();
        String baseName = stripExt(file.getOriginalFilename());
        byte[] fileBytes = readBytes(file);

        return asyncFileTaskService.submit(
                "video-to-audio", file.getOriginalFilename(), file.getSize(), 1,
                userId, clientIp,
                (progress) -> {
                    Path dir = Files.createTempDirectory("media-extract-audio-");
                    try {
                        Path inPath = dir.resolve("input." + inExt);
                        Path outPath = dir.resolve("output." + outFmt);
                        Files.write(inPath, fileBytes);
                        progress.report(5);

                        List<String> cmd = new ArrayList<>();
                        cmd.add(toolboxProperties.getFfmpeg().getPath());
                        cmd.add("-i"); cmd.add(inPath.toAbsolutePath().toString());
                        cmd.add("-vn");   // 去掉视频流
                        cmd.add("-acodec"); cmd.add(AUDIO_CODEC.get(outFmt));
                        if ("mp3".equals(outFmt)) {
                            cmd.add("-q:a"); cmd.add("2");   // VBR 高质量
                        }
                        cmd.add("-y");
                        cmd.add(outPath.toAbsolutePath().toString());

                        runFfmpeg(cmd, progress, 10, 90);

                        byte[] result = Files.readAllBytes(outPath);
                        progress.report(100);
                        String mime = AUDIO_MIME.getOrDefault(outFmt, "audio/mpeg");
                        return new FileTaskResult(result, baseName + "." + outFmt, mime);
                    } finally {
                        cleanup(dir);
                    }
                }
        );
    }

    // ====================================================================
    // 音频格式转换
    // ====================================================================

    @Override
    public String convertAudio(MultipartFile file, String format, Long userId, String clientIp) {
        requireFfmpeg();
        String inExt = resolveExt(file, AUDIO_EXT);
        if (format == null || !AUDIO_OUT.contains(format.toLowerCase())) {
            throw new BusinessException(ErrCode.PARAM_ERROR,
                    "不支持的目标格式，仅支持：" + String.join("/", AUDIO_OUT));
        }
        String outFmt = format.toLowerCase();
        String baseName = stripExt(file.getOriginalFilename());
        byte[] fileBytes = readBytes(file);

        return asyncFileTaskService.submit(
                "audio-convert", file.getOriginalFilename(), file.getSize(), 1,
                userId, clientIp,
                (progress) -> {
                    Path dir = Files.createTempDirectory("media-convert-audio-");
                    try {
                        Path inPath = dir.resolve("input." + inExt);
                        Path outPath = dir.resolve("output." + outFmt);
                        Files.write(inPath, fileBytes);
                        progress.report(5);

                        List<String> cmd = new ArrayList<>();
                        cmd.add(toolboxProperties.getFfmpeg().getPath());
                        cmd.add("-i"); cmd.add(inPath.toAbsolutePath().toString());
                        cmd.add("-codec:a"); cmd.add(AUDIO_CODEC.get(outFmt));
                        if ("mp3".equals(outFmt)) {
                            cmd.add("-q:a"); cmd.add("2");
                        }
                        cmd.add("-y");
                        cmd.add(outPath.toAbsolutePath().toString());

                        runFfmpeg(cmd, progress, 10, 90);

                        byte[] result = Files.readAllBytes(outPath);
                        progress.report(100);
                        String mime = AUDIO_MIME.getOrDefault(outFmt, "audio/mpeg");
                        return new FileTaskResult(result, baseName + "." + outFmt, mime);
                    } finally {
                        cleanup(dir);
                    }
                }
        );
    }

    // ====================================================================
    // 内部工具
    // ====================================================================

    /**
     * 运行 FFmpeg 命令，解析进度输出并上报。
     * FFmpeg 实时输出到 stderr，包含 time= 字段可估算进度。
     * 此处采用简化方式：命令执行期间模拟进度推进。
     *
     * @param cmd          FFmpeg 命令列表
     * @param progress     进度上报器
     * @param startPct     起始进度
     * @param endPct       完成进度（成功后由调用方上报 100）
     */
    private void runFfmpeg(List<String> cmd,
                           com.example.miletoolboxendproject.filetask.FileTaskProcessor.ProgressReporter progress,
                           int startPct, int endPct) throws Exception {
        ToolboxProperties.Ffmpeg cfg = toolboxProperties.getFfmpeg();
        log.debug("FFmpeg 命令：{}", String.join(" ", cmd));

        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.redirectErrorStream(true);
        Process proc = pb.start();

        // 读取输出（避免缓冲区阻塞）
        String output = StreamUtils.copyToString(proc.getInputStream(),
                java.nio.charset.StandardCharsets.UTF_8);

        boolean finished = proc.waitFor(cfg.getTimeoutSeconds(), TimeUnit.SECONDS);
        if (!finished) {
            proc.destroyForcibly();
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED,
                    "媒体转换超时（" + cfg.getTimeoutSeconds() + "s）");
        }
        if (proc.exitValue() != 0) {
            log.warn("FFmpeg 退出码 {}，输出：{}", proc.exitValue(), output);
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED,
                    "媒体转换失败（FFmpeg 退出码 " + proc.exitValue() + "）");
        }
        progress.report(endPct);
    }

    /** 解析并校验输入文件扩展名。 */
    private String resolveExt(MultipartFile file, Set<String> allowed) {
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
        if (name == null || name.isBlank()) return "output";
        int dot = name.lastIndexOf('.');
        return dot > 0 ? name.substring(0, dot) : name;
    }

    /** 读取 MultipartFile 字节（异步任务跨线程前必须提前读取）。 */
    private byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (Exception e) {
            throw new BusinessException(ErrCode.FILE_PROCESS_FAILED, "文件读取失败：" + e.getMessage());
        }
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
}
