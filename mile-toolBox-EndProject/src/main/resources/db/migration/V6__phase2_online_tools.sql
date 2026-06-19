-- =============================================================
-- V6__phase2_online_tools.sql  二期联网工具登记（§2，后端实现接口）
-- 来源：docs/前台-二期工具与功能增强-需求.md §2.1 / §2.3
-- handleType=1（后端处理）、status=0（上架）；带 nameEn/descriptionEn（i18n 方案B）。
-- categoryId 用子查询关联分类，避免硬编码 id；sort 在所属分类内顺延。
--   query 分类现有 sort 1-5（phone-location/ip-location/zipcode/geocode/idcard）→ weather 顺延 6
--   convert 分类现有 sort 1-5 + V5 的 chinese-convert(6) → currency 顺延 7
-- 接口：currency=GET /query/currency；weather=GET /query/weather（公开 + 限流）
-- =============================================================

-- 转换工具（convert）：currency（汇率换算，挂 convert，sort 7）
INSERT INTO `tool` (`toolKey`,`name`,`nameEn`,`categoryId`,`description`,`descriptionEn`,`handleType`,`routePath`,`sort`,`status`) VALUES
('currency','货币汇率换算','Currency Converter',(SELECT id FROM tool_category WHERE code='convert'),'实时汇率换算，支持全球主流货币','Real-time currency exchange conversion',1,'/tool/currency',7,0);

-- 查询工具（query）：weather（天气查询，挂 query，sort 6）
INSERT INTO `tool` (`toolKey`,`name`,`nameEn`,`categoryId`,`description`,`descriptionEn`,`handleType`,`routePath`,`sort`,`status`) VALUES
('weather','天气查询','Weather Query',(SELECT id FROM tool_category WHERE code='query'),'查询城市实时天气与多天预报','Real-time weather & multi-day forecast',1,'/tool/weather',6,0);
