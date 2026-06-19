-- =============================================================
-- V2__admin.sql  后台管理员账号表
-- 默认管理员由 AdminInitializer（CommandLineRunner）幂等创建，密码走 BCrypt，不在此硬编码哈希。
-- =============================================================
CREATE TABLE IF NOT EXISTS `admin_user` (
  `id`         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username`   VARCHAR(64)  NOT NULL                COMMENT '用户名（登录账号）',
  `password`   VARCHAR(100) NOT NULL                COMMENT '密码（BCrypt 哈希）',
  `nickname`   VARCHAR(64)  DEFAULT NULL            COMMENT '昵称',
  `status`     TINYINT      NOT NULL DEFAULT 0      COMMENT '状态：0正常 1禁用',
  `createTime` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admin_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='后台管理员表';
