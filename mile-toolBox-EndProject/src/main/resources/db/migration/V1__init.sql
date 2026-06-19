-- =============================================================
-- V1__init.sql  个人工具箱网站 初始化（6 张表 + 分类/工具种子）
-- 库：MySQL 8 / utf8mb4 / InnoDB。列名全驼峰（配合 MyBatis-Plus map-underscore=false）。
-- =============================================================

-- ---------- 1. 前台用户 ----------
CREATE TABLE IF NOT EXISTS `tool_user` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username`    VARCHAR(64)  NOT NULL                COMMENT '用户名（登录账号）',
  `password`    VARCHAR(100) NOT NULL                COMMENT '密码（BCrypt 哈希）',
  `nickname`    VARCHAR(64)  DEFAULT NULL            COMMENT '昵称',
  `avatar`      VARCHAR(500) DEFAULT NULL            COMMENT '头像URL',
  `email`       VARCHAR(128) DEFAULT NULL            COMMENT '邮箱',
  `phone`       VARCHAR(20)  DEFAULT NULL            COMMENT '手机号',
  `status`      TINYINT      NOT NULL DEFAULT 0      COMMENT '状态：0正常 1禁用',
  `createTime`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `updateTime`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='前台用户表';

-- ---------- 2. 工具分类 ----------
CREATE TABLE IF NOT EXISTS `tool_category` (
  `id`         BIGINT      NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `code`       VARCHAR(32) NOT NULL                COMMENT '分类编码',
  `name`       VARCHAR(64) NOT NULL                COMMENT '分类名称',
  `icon`       VARCHAR(64) DEFAULT NULL            COMMENT '图标标识',
  `sort`       INT         NOT NULL DEFAULT 0      COMMENT '排序（升序）',
  `status`     TINYINT     NOT NULL DEFAULT 0      COMMENT '状态：0启用 1停用',
  `createTime` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工具分类表';

-- ---------- 3. 工具 ----------
CREATE TABLE IF NOT EXISTS `tool` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '工具ID',
  `toolKey`     VARCHAR(64)  NOT NULL                COMMENT '工具唯一标识（前后端共享）',
  `name`        VARCHAR(64)  NOT NULL                COMMENT '工具名称',
  `categoryId`  BIGINT       NOT NULL                COMMENT '所属分类ID',
  `description` VARCHAR(255) DEFAULT NULL            COMMENT '工具描述',
  `icon`        VARCHAR(64)  DEFAULT NULL            COMMENT '图标标识',
  `handleType`  TINYINT      NOT NULL DEFAULT 0      COMMENT '处理位置：0前端 1后端',
  `routePath`   VARCHAR(128) DEFAULT NULL            COMMENT '前端路由路径',
  `useCount`    BIGINT       NOT NULL DEFAULT 0      COMMENT '累计使用次数',
  `status`      TINYINT      NOT NULL DEFAULT 0      COMMENT '状态：0上架 1下架',
  `sort`        INT          NOT NULL DEFAULT 0      COMMENT '排序（升序）',
  `createTime`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_toolKey` (`toolKey`),
  KEY `idx_category_status` (`categoryId`, `status`),
  KEY `idx_useCount` (`useCount`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工具表';

-- ---------- 4. 用户收藏 ----------
CREATE TABLE IF NOT EXISTS `tool_favorite` (
  `id`         BIGINT   NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  `userId`     BIGINT   NOT NULL                COMMENT '用户ID',
  `toolId`     BIGINT   NOT NULL                COMMENT '工具ID',
  `createTime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_tool` (`userId`, `toolId`),
  KEY `idx_user` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表';

-- ---------- 5. 使用记录 ----------
CREATE TABLE IF NOT EXISTS `tool_usage_record` (
  `id`         BIGINT      NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `userId`     BIGINT      DEFAULT NULL            COMMENT '用户ID（游客为空）',
  `toolId`     BIGINT      DEFAULT NULL            COMMENT '工具ID',
  `toolKey`    VARCHAR(64) NOT NULL                COMMENT '工具标识（冗余）',
  `createTime` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '使用时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_time` (`userId`, `createTime`),
  KEY `idx_toolKey` (`toolKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工具使用记录表';

-- ---------- 6. 文件处理任务 ----------
CREATE TABLE IF NOT EXISTS `tool_file_task` (
  `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `userId`      BIGINT       DEFAULT NULL            COMMENT '用户ID（游客为空）',
  `toolKey`     VARCHAR(64)  NOT NULL                COMMENT '工具标识',
  `status`      TINYINT      NOT NULL DEFAULT 0      COMMENT '状态：0待处理 1处理中 2成功 3失败',
  `inputFile`   VARCHAR(500) DEFAULT NULL            COMMENT '输入文件信息',
  `outputFile`  VARCHAR(500) DEFAULT NULL            COMMENT '输出文件路径/下载Key',
  `errorMsg`    VARCHAR(500) DEFAULT NULL            COMMENT '失败原因',
  `expireTime`  DATETIME     DEFAULT NULL            COMMENT '产物过期时间（TTL清理依据）',
  `createTime`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `finishTime`  DATETIME     DEFAULT NULL            COMMENT '完成时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_time` (`userId`, `createTime`),
  KEY `idx_status` (`status`),
  KEY `idx_expire` (`expireTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件处理任务表';

-- =============================================================
-- 种子数据：分类
-- =============================================================
INSERT INTO `tool_category` (`code`, `name`, `icon`, `sort`, `status`) VALUES
('query',   '查询工具',   'search',    1, 0),
('convert', '转换工具',   'transfer',  2, 0),
('file',    '文件处理',   'file',      3, 0),
('color',   '设计配色',   'palette',   4, 0),
('crypto',  '加密编码',   'lock',      5, 0),
('dev',     '开发者工具', 'code',      6, 0),
('text',    '文本处理',   'document',  7, 0);

-- =============================================================
-- 种子数据：一期 31 个工具（categoryId 用子查询关联分类）
-- =============================================================
-- 查询类
INSERT INTO `tool` (`toolKey`,`name`,`categoryId`,`description`,`handleType`,`routePath`,`sort`,`status`) VALUES
('phone-location','手机号归属地查询',(SELECT id FROM tool_category WHERE code='query'),'查询手机号归属地与运营商',1,'/tool/phone-location',1,0),
('ip-location','IP归属地查询',(SELECT id FROM tool_category WHERE code='query'),'查询IP地址归属地',1,'/tool/ip-location',2,0),
('zipcode','邮编查询',(SELECT id FROM tool_category WHERE code='query'),'按地区查询邮政编码',1,'/tool/zipcode',3,0),
('geocode','经纬度地址互查',(SELECT id FROM tool_category WHERE code='query'),'地址与经纬度互相转换（维智地图）',1,'/tool/geocode',4,0),
('idcard','身份证信息校验',(SELECT id FROM tool_category WHERE code='query'),'校验身份证并解析归属地/生日/性别',0,'/tool/idcard',5,0);

-- 转换类
INSERT INTO `tool` (`toolKey`,`name`,`categoryId`,`description`,`handleType`,`routePath`,`sort`,`status`) VALUES
('unit-convert','单位转换',(SELECT id FROM tool_category WHERE code='convert'),'长度/重量/温度/面积/数据等单位换算',0,'/tool/unit-convert',1,0),
('radix-convert','进制转换',(SELECT id FROM tool_category WHERE code='convert'),'2/8/10/16进制互转',0,'/tool/radix-convert',2,0),
('timestamp','时间戳转换',(SELECT id FROM tool_category WHERE code='convert'),'时间戳与日期互转',0,'/tool/timestamp',3,0),
('doc-convert','文档转换',(SELECT id FROM tool_category WHERE code='convert'),'doc→MD / MD→PDF / Office互转',1,'/tool/doc-convert',4,0),
('color-convert','颜色格式转换',(SELECT id FROM tool_category WHERE code='convert'),'HEX/RGB/HSL互转',0,'/tool/color-convert',5,0);

-- 文件处理类
INSERT INTO `tool` (`toolKey`,`name`,`categoryId`,`description`,`handleType`,`routePath`,`sort`,`status`) VALUES
('pdf-merge','PDF合并',(SELECT id FROM tool_category WHERE code='file'),'多个PDF合并拼合为一个',1,'/tool/pdf-merge',1,0),
('pdf-split','PDF拆分',(SELECT id FROM tool_category WHERE code='file'),'PDF拆分/提取页/删除页',1,'/tool/pdf-split',2,0),
('pdf-watermark','PDF加水印',(SELECT id FROM tool_category WHERE code='file'),'为PDF添加文字/图片水印',1,'/tool/pdf-watermark',3,0),
('pdf-encrypt','PDF加密解密',(SELECT id FROM tool_category WHERE code='file'),'PDF密码加密与解密',1,'/tool/pdf-encrypt',4,0),
('pdf-image','PDF与图片互转',(SELECT id FROM tool_category WHERE code='file'),'PDF转图片/图片转PDF',1,'/tool/pdf-image',5,0),
('image-compress','图片压缩',(SELECT id FROM tool_category WHERE code='file'),'压缩图片体积',0,'/tool/image-compress',6,0),
('image-convert','图片格式转换',(SELECT id FROM tool_category WHERE code='file'),'图片格式互转（含WebP）',1,'/tool/image-convert',7,0),
('image-edit','图片编辑',(SELECT id FROM tool_category WHERE code='file'),'图片缩放/裁剪/加水印',0,'/tool/image-edit',8,0);

-- 设计配色类
INSERT INTO `tool` (`toolKey`,`name`,`categoryId`,`description`,`handleType`,`routePath`,`sort`,`status`) VALUES
('palette','配色大全',(SELECT id FROM tool_category WHERE code='color'),'精选配色方案与调色板',0,'/tool/palette',1,0),
('china-color','中国传统色',(SELECT id FROM tool_category WHERE code='color'),'中国传统色与Web安全色',0,'/tool/china-color',2,0),
('gradient','渐变生成器',(SELECT id FROM tool_category WHERE code='color'),'CSS渐变可视化生成',0,'/tool/gradient',3,0);

-- 加密编码类
INSERT INTO `tool` (`toolKey`,`name`,`categoryId`,`description`,`handleType`,`routePath`,`sort`,`status`) VALUES
('text-crypto','文本加密',(SELECT id FROM tool_category WHERE code='crypto'),'AES/DES/RSA文本加解密',0,'/tool/text-crypto',1,0),
('hash','Hash计算',(SELECT id FROM tool_category WHERE code='crypto'),'MD5/SHA1/SHA256哈希',0,'/tool/hash',2,0),
('base64','Base64编解码',(SELECT id FROM tool_category WHERE code='crypto'),'文本/图片Base64互转',0,'/tool/base64',3,0),
('url-encode','URL编解码',(SELECT id FROM tool_category WHERE code='crypto'),'URL编码与解码',0,'/tool/url-encode',4,0),
('password-gen','密码生成器',(SELECT id FROM tool_category WHERE code='crypto'),'生成强随机密码',0,'/tool/password-gen',5,0),
('qrcode','二维码工具',(SELECT id FROM tool_category WHERE code='crypto'),'二维码生成与识别',0,'/tool/qrcode',6,0);

-- 开发者工具类
INSERT INTO `tool` (`toolKey`,`name`,`categoryId`,`description`,`handleType`,`routePath`,`sort`,`status`) VALUES
('json-tool','JSON工具',(SELECT id FROM tool_category WHERE code='dev'),'JSON格式化/校验/JSON↔YAML↔XML',0,'/tool/json-tool',1,0),
('regex-test','正则测试',(SELECT id FROM tool_category WHERE code='dev'),'正则表达式在线测试',0,'/tool/regex-test',2,0),
('uuid','UUID生成',(SELECT id FROM tool_category WHERE code='dev'),'批量生成UUID',0,'/tool/uuid',3,0);

-- 文本处理类
INSERT INTO `tool` (`toolKey`,`name`,`categoryId`,`description`,`handleType`,`routePath`,`sort`,`status`) VALUES
('word-count','字数统计',(SELECT id FROM tool_category WHERE code='text'),'统计字数/字符/行数',0,'/tool/word-count',1,0);
