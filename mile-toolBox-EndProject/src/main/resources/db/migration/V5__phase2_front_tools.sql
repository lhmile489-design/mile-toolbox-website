-- =============================================================
-- V5__phase2_front_tools.sql  二期前端工具登记（§1，纯前端逻辑，无后端业务接口）
-- 来源：docs/前台-二期工具与功能增强-需求.md §1
-- 全部 handleType=0（前端处理）、status=0（上架）；带 nameEn/descriptionEn（i18n 方案B）。
-- categoryId 用子查询关联分类，避免硬编码 id；sort 在所属分类内顺延。
-- =============================================================

-- 开发者工具（dev）：jwt-decode / cron-parser / case-convert（现有 sort 1-3，顺延 4-6）
INSERT INTO `tool` (`toolKey`,`name`,`nameEn`,`categoryId`,`description`,`descriptionEn`,`handleType`,`routePath`,`sort`,`status`) VALUES
('jwt-decode','JWT解析','JWT Decoder',(SELECT id FROM tool_category WHERE code='dev'),'解析JWT的Header/Payload与过期时间','Decode JWT header/payload & expiry',0,'/tool/jwt-decode',4,0),
('cron-parser','Cron表达式','Cron Parser',(SELECT id FROM tool_category WHERE code='dev'),'解释Cron并列出近几次执行时间','Explain cron & list next runs',0,'/tool/cron-parser',5,0),
('case-convert','命名转换','Case Convert',(SELECT id FROM tool_category WHERE code='dev'),'camelCase/snake_case/kebab/CONSTANT互转','Convert between naming cases',0,'/tool/case-convert',6,0);

-- 文本处理（text）：text-diff / markdown / text-dedup（现有 sort 1，顺延 2-4）
INSERT INTO `tool` (`toolKey`,`name`,`nameEn`,`categoryId`,`description`,`descriptionEn`,`handleType`,`routePath`,`sort`,`status`) VALUES
('text-diff','文本对比','Text Diff',(SELECT id FROM tool_category WHERE code='text'),'对比两段文本的差异并高亮','Compare two texts and highlight diffs',0,'/tool/text-diff',2,0),
('markdown','Markdown预览','Markdown',(SELECT id FROM tool_category WHERE code='text'),'Markdown编辑与实时预览','Edit Markdown with live preview',0,'/tool/markdown',3,0),
('text-dedup','去重排序','Dedup & Sort',(SELECT id FROM tool_category WHERE code='text'),'按行去重/排序/去空白','Dedupe / sort / trim lines',0,'/tool/text-dedup',4,0);

-- 转换工具（convert）：chinese-convert（现有 sort 1-5，顺延 6）
INSERT INTO `tool` (`toolKey`,`name`,`nameEn`,`categoryId`,`description`,`descriptionEn`,`handleType`,`routePath`,`sort`,`status`) VALUES
('chinese-convert','简繁转换','Chinese Convert',(SELECT id FROM tool_category WHERE code='convert'),'简体↔繁体互转','Simplified <-> Traditional Chinese',0,'/tool/chinese-convert',6,0);
