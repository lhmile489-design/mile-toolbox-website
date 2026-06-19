-- =============================================================
-- V8__file_task_rebuild.sql  统一重建 tool_file_task 表（修复历史结构漂移 + 支持异步）
--
-- 背景：早期按《数据库设计.md》手工建过 tool_file_task（inputFile/outputFile/finishTime/
--   status 4态），V4 用 CREATE TABLE IF NOT EXISTS 未覆盖它 → 实际表结构与 V4 实体长期不一致，
--   导致 @TrackFileTask 同步流水写入撞 Unknown column 被静默吞掉（该表始终 0 行）。
-- 处理：该表在所有环境均为空（从未成功写入），DROP + 重建零数据损失，一次对齐为最终结构。
--   最终结构 = 同步流水字段（fileName/fileSize/fileCount/costMs/clientIp）+ 异步字段
--   （taskId/async/progress/resultXxx/expireTime）。
--   status：0成功 1失败 2待处理(PENDING) 3处理中(PROCESSING)；同步流水只用 0/1。
-- 列名驼峰（项目 map-underscore 关闭）。
-- =============================================================

DROP TABLE IF EXISTS `tool_file_task`;

CREATE TABLE `tool_file_task` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `taskId`     VARCHAR(36)  DEFAULT NULL            COMMENT '异步任务UUID（同步流水为空）',
  `toolKey`    VARCHAR(64)  NOT NULL                COMMENT '工具标识（如 pdf-merge）',
  `async`      TINYINT      NOT NULL DEFAULT 0      COMMENT '是否异步任务：0同步流水 1异步任务',
  `fileName`   VARCHAR(255) DEFAULT NULL            COMMENT '输入文件名（多文件取首个 + 数量）',
  `fileSize`   BIGINT       NOT NULL DEFAULT 0      COMMENT '输入文件总大小（字节）',
  `fileCount`  INT          NOT NULL DEFAULT 1      COMMENT '输入文件数量',
  `status`     TINYINT      NOT NULL DEFAULT 0      COMMENT '状态：0成功 1失败 2待处理 3处理中',
  `progress`   INT          NOT NULL DEFAULT 0      COMMENT '进度百分比 0-100（异步任务）',
  `errorMsg`   VARCHAR(500) DEFAULT NULL            COMMENT '失败原因（status=1 时）',
  `resultName` VARCHAR(255) DEFAULT NULL            COMMENT '产物文件名（异步成功后）',
  `resultUrl`  VARCHAR(500) DEFAULT NULL            COMMENT '产物COS URL（启用对象存储时）',
  `resultPath` VARCHAR(500) DEFAULT NULL            COMMENT '产物本地临时路径（未启用COS时）',
  `resultType` VARCHAR(128) DEFAULT NULL            COMMENT '产物MIME类型',
  `expireTime` DATETIME     DEFAULT NULL            COMMENT '产物过期时间（到期清理）',
  `costMs`     BIGINT       NOT NULL DEFAULT 0      COMMENT '处理耗时（毫秒）',
  `userId`     BIGINT       DEFAULT NULL            COMMENT '处理用户ID（游客为空）',
  `clientIp`   VARCHAR(64)  DEFAULT NULL            COMMENT '客户端IP',
  `createTime` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_file_task_taskId` (`taskId`),
  KEY `idx_file_task_toolKey` (`toolKey`),
  KEY `idx_file_task_status` (`status`),
  KEY `idx_file_task_async_status` (`async`, `status`),
  KEY `idx_file_task_createTime` (`createTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件处理任务表（同步流水 + 异步任务）';
