-- =============================================================
-- V3__i18n.sql  多语言下发（方案B）：分类/工具增加英文字段并回填
-- 列名驼峰，配合 MyBatis-Plus map-underscore=false / table-underline=false
-- =============================================================

-- 分类英文名
ALTER TABLE `tool_category` ADD COLUMN `nameEn` VARCHAR(64) DEFAULT NULL COMMENT '分类名称(英文)' AFTER `name`;

-- 工具英文名 / 英文描述
ALTER TABLE `tool` ADD COLUMN `nameEn` VARCHAR(64) DEFAULT NULL COMMENT '工具名称(英文)' AFTER `name`;
ALTER TABLE `tool` ADD COLUMN `descriptionEn` VARCHAR(255) DEFAULT NULL COMMENT '工具描述(英文)' AFTER `description`;

-- ---------- 分类英文 ----------
UPDATE `tool_category` SET `nameEn` = 'Query'     WHERE `code` = 'query';
UPDATE `tool_category` SET `nameEn` = 'Convert'   WHERE `code` = 'convert';
UPDATE `tool_category` SET `nameEn` = 'File'      WHERE `code` = 'file';
UPDATE `tool_category` SET `nameEn` = 'Design'    WHERE `code` = 'color';
UPDATE `tool_category` SET `nameEn` = 'Crypto'    WHERE `code` = 'crypto';
UPDATE `tool_category` SET `nameEn` = 'Developer' WHERE `code` = 'dev';
UPDATE `tool_category` SET `nameEn` = 'Text'      WHERE `code` = 'text';

-- ---------- 工具英文（name / description）----------
UPDATE `tool` SET `nameEn`='Phone Location',   `descriptionEn`='Look up phone number location & carrier'        WHERE `toolKey`='phone-location';
UPDATE `tool` SET `nameEn`='IP Location',      `descriptionEn`='Look up IP geolocation'                        WHERE `toolKey`='ip-location';
UPDATE `tool` SET `nameEn`='Zip Code',         `descriptionEn`='Look up postal codes by region'                WHERE `toolKey`='zipcode';
UPDATE `tool` SET `nameEn`='Geocoding',        `descriptionEn`='Convert between address and coordinates'        WHERE `toolKey`='geocode';
UPDATE `tool` SET `nameEn`='ID Card Validator',`descriptionEn`='Validate ID and parse region/birth/gender'      WHERE `toolKey`='idcard';

UPDATE `tool` SET `nameEn`='Unit Converter',   `descriptionEn`='Length/weight/temperature/area/data units'      WHERE `toolKey`='unit-convert';
UPDATE `tool` SET `nameEn`='Radix Converter',  `descriptionEn`='Convert between 2/8/10/16 bases'                WHERE `toolKey`='radix-convert';
UPDATE `tool` SET `nameEn`='Timestamp',        `descriptionEn`='Convert between timestamp and date'             WHERE `toolKey`='timestamp';
UPDATE `tool` SET `nameEn`='Document Converter',`descriptionEn`='doc to MD / MD to PDF / Office conversion'      WHERE `toolKey`='doc-convert';
UPDATE `tool` SET `nameEn`='Color Converter',  `descriptionEn`='HEX/RGB/HSL conversion'                         WHERE `toolKey`='color-convert';

UPDATE `tool` SET `nameEn`='PDF Merge',        `descriptionEn`='Merge multiple PDFs into one'                   WHERE `toolKey`='pdf-merge';
UPDATE `tool` SET `nameEn`='PDF Split',        `descriptionEn`='Split / extract / remove pages'                 WHERE `toolKey`='pdf-split';
UPDATE `tool` SET `nameEn`='PDF Watermark',    `descriptionEn`='Add text watermark to PDF'                      WHERE `toolKey`='pdf-watermark';
UPDATE `tool` SET `nameEn`='PDF Encrypt',      `descriptionEn`='Encrypt PDF with a password'                    WHERE `toolKey`='pdf-encrypt';
UPDATE `tool` SET `nameEn`='PDF & Image',      `descriptionEn`='PDF to image / image to PDF'                    WHERE `toolKey`='pdf-image';
UPDATE `tool` SET `nameEn`='Image Compress',   `descriptionEn`='Reduce image file size'                         WHERE `toolKey`='image-compress';
UPDATE `tool` SET `nameEn`='Image Converter',  `descriptionEn`='Convert image formats (incl. WebP)'             WHERE `toolKey`='image-convert';
UPDATE `tool` SET `nameEn`='Image Editor',     `descriptionEn`='Resize / crop / watermark image'               WHERE `toolKey`='image-edit';

UPDATE `tool` SET `nameEn`='Color Palette',    `descriptionEn`='Curated color schemes & palettes'              WHERE `toolKey`='palette';
UPDATE `tool` SET `nameEn`='Chinese Colors',   `descriptionEn`='Chinese traditional & web-safe colors'          WHERE `toolKey`='china-color';
UPDATE `tool` SET `nameEn`='Gradient Maker',   `descriptionEn`='Visual CSS gradient generator'                  WHERE `toolKey`='gradient';

UPDATE `tool` SET `nameEn`='Text Encrypt',     `descriptionEn`='AES/DES/RSA text encryption'                    WHERE `toolKey`='text-crypto';
UPDATE `tool` SET `nameEn`='Hash',             `descriptionEn`='MD5/SHA1/SHA256 hashing'                        WHERE `toolKey`='hash';
UPDATE `tool` SET `nameEn`='Base64',           `descriptionEn`='Base64 encode/decode text & image'             WHERE `toolKey`='base64';
UPDATE `tool` SET `nameEn`='URL Encode',       `descriptionEn`='URL encode & decode'                            WHERE `toolKey`='url-encode';
UPDATE `tool` SET `nameEn`='Password Generator',`descriptionEn`='Generate strong random passwords'              WHERE `toolKey`='password-gen';
UPDATE `tool` SET `nameEn`='QR Code',          `descriptionEn`='Generate & scan QR codes'                       WHERE `toolKey`='qrcode';

UPDATE `tool` SET `nameEn`='JSON Tool',        `descriptionEn`='Format/validate JSON, JSON/YAML/XML'            WHERE `toolKey`='json-tool';
UPDATE `tool` SET `nameEn`='Regex Tester',     `descriptionEn`='Test regular expressions online'               WHERE `toolKey`='regex-test';
UPDATE `tool` SET `nameEn`='UUID Generator',   `descriptionEn`='Generate UUIDs in bulk'                         WHERE `toolKey`='uuid';

UPDATE `tool` SET `nameEn`='Word Count',       `descriptionEn`='Count words/characters/lines'                   WHERE `toolKey`='word-count';
