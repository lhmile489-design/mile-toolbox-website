-- =============================================================
-- V11__phase5_media_tools.sql  五期媒体工具登记（4 个 FFmpeg 后端工具）
-- 全部 handleType=1（后端处理，异步任务）、status=0（上架）；带 nameEn/descriptionEn（i18n 方案B）。
-- categoryId 用子查询关联分类，避免硬编码 id。
-- sort 在 file 分类已有最大值（V10：image-invert=15）基础上顺延：
--   file → video-compress=16, video-convert=17, video-to-audio=18, audio-convert=19
-- =============================================================

-- 媒体工具（file 分类）：视频压缩 / 视频转换 / 提取音频 / 音频转换
INSERT INTO `tool` (`toolKey`,`name`,`nameEn`,`categoryId`,`description`,`descriptionEn`,`handleType`,`routePath`,`sort`,`status`) VALUES
('video-compress','视频压缩','Video Compress',
    (SELECT id FROM tool_category WHERE code='file'),
    '压缩视频体积，支持调整分辨率与画质，减小文件大小',
    'Compress video file size with adjustable resolution and quality',
    1,'/tool/video-compress',16,0),
('video-convert','视频转换','Video Convert',
    (SELECT id FROM tool_category WHERE code='file'),
    '视频格式互转，支持 MP4/AVI/MOV/MKV/WebM',
    'Convert between video formats: MP4, AVI, MOV, MKV, WebM',
    1,'/tool/video-convert',17,0),
('video-to-audio','提取音频','Extract Audio',
    (SELECT id FROM tool_category WHERE code='file'),
    '从视频中提取音轨，导出为 MP3/AAC/WAV',
    'Extract audio track from video, export as MP3, AAC or WAV',
    1,'/tool/video-to-audio',18,0),
('audio-convert','音频转换','Audio Convert',
    (SELECT id FROM tool_category WHERE code='file'),
    '音频格式互转，支持 MP3/WAV/AAC/FLAC/OGG',
    'Convert between audio formats: MP3, WAV, AAC, FLAC, OGG',
    1,'/tool/audio-convert',19,0);
