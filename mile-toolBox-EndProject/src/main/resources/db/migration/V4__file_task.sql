-- =============================================================
-- V4__file_task.sql  文件处理任务记录表
-- 记录后端文件工具（PDF/图片/文档）的同步处理流水，供后台「文件任务监控」使用。
-- 由 @TrackFileTask AOP 切面在处理成功/失败时落库，记录失败不影响主流程。
-- 二期异步任务（视频）复用本表：新增 PENDING/PROCESSING 状态 + taskId 即可。
-- =============================================================
CREATE TABLE IF NOT EXISTS `tool_file_task` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `toolKey`    VARCHAR(64)  NOT NULL                COMMENT '工具标识（如 pdf-merge）',
  `fileName`   VARCHAR(255) DEFAULT NULL            COMMENT '输入文件名（多文件取首个 + 数量）',
  `fileSize`   BIGINT       NOT NULL DEFAULT 0      COMMENT '输入文件总大小（字节）',
  `fileCount`  INT          NOT NULL DEFAULT 1      COMMENT '输入文件数量',
  `status`     TINYINT      NOT NULL DEFAULT 0      COMMENT '状态：0成功 1失败',
  `errorMsg`   VARCHAR(500) DEFAULT NULL            COMMENT '失败原因（status=1 时）',
  `costMs`     BIGINT       NOT NULL DEFAULT 0      COMMENT '处理耗时（毫秒）',
  `userId`     BIGINT       DEFAULT NULL            COMMENT '处理用户ID（游客为空）',
  `clientIp`   VARCHAR(64)  DEFAULT NULL            COMMENT '客户端IP',
  `createTime` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_file_task_toolKey` (`toolKey`),
  KEY `idx_file_task_status` (`status`),
  KEY `idx_file_task_createTime` (`createTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件处理任务记录表';
