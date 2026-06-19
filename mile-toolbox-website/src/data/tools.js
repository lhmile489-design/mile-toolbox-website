/**
 * 工具 / 分类的「种子数据 + 前端元数据 + 英文标签兜底」。
 *
 * 数据来源：运行时由后端接口下发（GET /tool/categories、/tool/list、/tool/hot）。
 * 本文件提供三件事：
 *  1) 种子数据（SEED）：后端不可达时的离线兜底，形状对齐后端 VO。
 *  2) 前端元数据（CATEGORY_META）：图标 / 主题强调色，按分类 code 映射（后端不下发设计令牌）。
 *  3) 英文标签兜底（TOOL_I18N / nameEn）：后端 v1 只下发中文，英文界面用本地映射。
 *
 * normalizeCategory / normalizeTool 把后端 VO（或种子）规整成组件友好的统一结构：
 *   tool: { id, toolKey, name, nameEn, desc, descEn, categoryId, categoryCode,
 *           icon, accent, handleType: 'front'|'back', routePath, useCount, favorited }
 */

/** 分类种子（后端 VO 形状 + 前端 nameEn/icon/accent） */
export const CATEGORIES_SEED = [
  { id: 1, code: 'query', name: '查询工具', nameEn: 'Query', icon: 'search', accent: 'var(--cat-query)', sort: 1, status: 0 },
  { id: 2, code: 'convert', name: '转换工具', nameEn: 'Convert', icon: 'convert', accent: 'var(--cat-convert)', sort: 2, status: 0 },
  { id: 3, code: 'file', name: '文件处理', nameEn: 'Files', icon: 'file', accent: 'var(--cat-file)', sort: 3, status: 0 },
  { id: 4, code: 'color', name: '设计配色', nameEn: 'Color', icon: 'palette', accent: 'var(--cat-color)', sort: 4, status: 0 },
  { id: 5, code: 'crypto', name: '加密编码', nameEn: 'Crypto', icon: 'lock', accent: 'var(--cat-crypto)', sort: 5, status: 0 },
  { id: 6, code: 'dev', name: '开发者工具', nameEn: 'Developer', icon: 'code', accent: 'var(--cat-dev)', sort: 6, status: 0 },
  { id: 7, code: 'text', name: '文本处理', nameEn: 'Text', icon: 'text', accent: 'var(--cat-text)', sort: 7, status: 0 },
];

/** 工具种子（后端 VO 形状：handleType 0=前端/1=后端；categoryId 关联分类） */
export const TOOLS_SEED = [
  // A. 查询类 (categoryId 1)
  { id: 1, toolKey: 'phone-location', name: '手机号归属地', nameEn: 'Phone Lookup', categoryId: 1, handleType: 1, routePath: '/tools/phone-location', description: '查询手机号归属省市与运营商', descEn: "Find a mobile number's region and carrier", useCount: 4820, favorited: false },
  { id: 2, toolKey: 'ip-location', name: 'IP 归属地查询', nameEn: 'IP Lookup', categoryId: 1, handleType: 1, routePath: '/tools/ip-location', description: '基于离线库定位 IP 地理位置', descEn: 'Locate an IP using an offline database', useCount: 6310, favorited: false },
  { id: 3, toolKey: 'zipcode', name: '邮政编码查询', nameEn: 'Zip Code', categoryId: 1, handleType: 1, routePath: '/tools/zipcode', description: '查询全国行政区邮政编码', descEn: 'Look up postal codes nationwide', useCount: 1290, favorited: false },
  { id: 4, toolKey: 'geocode', name: '经纬度 ↔ 地址', nameEn: 'Geocoding', categoryId: 1, handleType: 1, routePath: '/tools/geocode', description: '坐标与地址互转地理编码', descEn: 'Convert between coordinates and address', useCount: 2040, favorited: false },
  { id: 5, toolKey: 'idcard', name: '身份证校验', nameEn: 'ID Validator', categoryId: 1, handleType: 0, routePath: '/tools/idcard', description: '校验身份证并解析地区/性别/生日', descEn: 'Validate IDs and parse region/sex/birthday', useCount: 3580, favorited: false },

  // B. 转换类 (categoryId 2)
  { id: 6, toolKey: 'unit-convert', name: '单位转换', nameEn: 'Unit Converter', categoryId: 2, handleType: 0, routePath: '/tools/unit-convert', description: '长度/重量/温度/面积等单位换算', descEn: 'Convert length, weight, temperature, area and more', useCount: 5120, favorited: false },
  { id: 7, toolKey: 'radix-convert', name: '进制转换', nameEn: 'Base Converter', categoryId: 2, handleType: 0, routePath: '/tools/radix-convert', description: '二/八/十/十六进制相互转换', descEn: 'Convert between binary, octal, decimal and hex', useCount: 4470, favorited: false },
  { id: 8, toolKey: 'timestamp', name: '时间戳转换', nameEn: 'Timestamp', categoryId: 2, handleType: 0, routePath: '/tools/timestamp', description: 'Unix 时间戳与日期时间互转', descEn: 'Convert between Unix timestamps and dates', useCount: 7650, favorited: false },
  { id: 9, toolKey: 'doc-convert', name: '文档转换', nameEn: 'Doc Converter', categoryId: 2, handleType: 1, routePath: '/tools/doc-convert', description: 'doc ↔ Markdown ↔ PDF / Office 互转', descEn: 'doc ↔ Markdown ↔ PDF / Office conversion', useCount: 2880, favorited: false },
  { id: 10, toolKey: 'color-convert', name: '颜色格式转换', nameEn: 'Color Converter', categoryId: 2, handleType: 0, routePath: '/tools/color-convert', description: 'HEX / RGB / HSL 颜色互转', descEn: 'Convert between HEX, RGB and HSL', useCount: 3960, favorited: false },

  // C. 文件处理类 (categoryId 3)
  { id: 11, toolKey: 'pdf-merge', name: 'PDF 合并', nameEn: 'PDF Merge', categoryId: 3, handleType: 1, routePath: '/tools/pdf-merge', description: '多个 PDF 拼合为一个文件', descEn: 'Combine multiple PDFs into one', useCount: 8240, favorited: false },
  { id: 12, toolKey: 'pdf-split', name: 'PDF 拆分', nameEn: 'PDF Split', categoryId: 3, handleType: 1, routePath: '/tools/pdf-split', description: '按页拆分 / 提取页 / 删除页', descEn: 'Split, extract or delete pages', useCount: 5630, favorited: false },
  { id: 13, toolKey: 'pdf-watermark', name: 'PDF 加水印', nameEn: 'PDF Watermark', categoryId: 3, handleType: 1, routePath: '/tools/pdf-watermark', description: '为 PDF 批量添加文字水印', descEn: 'Batch-add text watermarks to PDFs', useCount: 2410, favorited: false },
  { id: 14, toolKey: 'pdf-encrypt', name: 'PDF 加密解密', nameEn: 'PDF Encrypt', categoryId: 3, handleType: 1, routePath: '/tools/pdf-encrypt', description: '为 PDF 设置或移除密码', descEn: 'Add or remove a PDF password', useCount: 1980, favorited: false },
  { id: 15, toolKey: 'pdf-image', name: 'PDF ↔ 图片', nameEn: 'PDF ↔ Image', categoryId: 3, handleType: 1, routePath: '/tools/pdf-image', description: 'PDF 转图片 / 图片合成 PDF', descEn: 'PDF to images or images to PDF', useCount: 4150, favorited: false },
  { id: 16, toolKey: 'image-compress', name: '图片压缩', nameEn: 'Image Compress', categoryId: 3, handleType: 0, routePath: '/tools/image-compress', description: '本地无损/有损压缩图片体积', descEn: 'Shrink image size locally, lossy or lossless', useCount: 9120, favorited: false },
  { id: 17, toolKey: 'image-convert', name: '图片格式转换', nameEn: 'Image Convert', categoryId: 3, handleType: 1, routePath: '/tools/image-convert', description: 'PNG/JPG/WebP 等格式互转', descEn: 'Convert PNG/JPG/WebP and more', useCount: 6740, favorited: false },
  { id: 18, toolKey: 'image-edit', name: '图片编辑', nameEn: 'Image Editor', categoryId: 3, handleType: 0, routePath: '/tools/image-edit', description: '本地缩放 / 裁剪 / 加水印', descEn: 'Resize, crop and watermark locally', useCount: 3320, favorited: false },

  // D. 设计/颜色类 (categoryId 4)
  { id: 19, toolKey: 'palette', name: '配色调色板', nameEn: 'Palettes', categoryId: 4, handleType: 0, routePath: '/tools/palette', description: '配色大全与调色板生成', descEn: 'Color palette library and generator', useCount: 5890, favorited: false },
  { id: 20, toolKey: 'china-color', name: '中国传统色', nameEn: 'Chinese Colors', categoryId: 4, handleType: 0, routePath: '/tools/china-color', description: '中国传统色 / Web 安全色速查', descEn: 'Traditional Chinese & web-safe color reference', useCount: 4360, favorited: false },
  { id: 21, toolKey: 'gradient', name: '渐变生成器', nameEn: 'Gradient Maker', categoryId: 4, handleType: 0, routePath: '/tools/gradient', description: '可视化生成 CSS 渐变代码', descEn: 'Visually generate CSS gradient code', useCount: 5210, favorited: false },

  // E. 加密/编码/安全类 (categoryId 5)
  { id: 22, toolKey: 'text-crypto', name: '文本加密', nameEn: 'Text Crypto', categoryId: 5, handleType: 0, routePath: '/tools/text-crypto', description: 'AES / DES / RSA 文本加解密', descEn: 'AES / DES / RSA text encryption', useCount: 3740, favorited: false },
  { id: 23, toolKey: 'hash', name: 'Hash 计算', nameEn: 'Hash', categoryId: 5, handleType: 0, routePath: '/tools/hash', description: 'MD5 / SHA1 / SHA256 摘要', descEn: 'MD5 / SHA1 / SHA256 digests', useCount: 6980, favorited: false },
  { id: 24, toolKey: 'base64', name: 'Base64 编解码', nameEn: 'Base64', categoryId: 5, handleType: 0, routePath: '/tools/base64', description: '文本与图片 Base64 互转', descEn: 'Encode/decode text and images', useCount: 8470, favorited: false },
  { id: 25, toolKey: 'url-encode', name: 'URL 编解码', nameEn: 'URL Encode', categoryId: 5, handleType: 0, routePath: '/tools/url-encode', description: 'URL 转义与还原', descEn: 'Escape and unescape URLs', useCount: 4920, favorited: false },
  { id: 26, toolKey: 'password-gen', name: '密码生成器', nameEn: 'Password Gen', categoryId: 5, handleType: 0, routePath: '/tools/password-gen', description: '生成高强度随机密码', descEn: 'Generate strong random passwords', useCount: 7280, favorited: false },
  { id: 27, toolKey: 'qrcode', name: '二维码工具', nameEn: 'QR Code', categoryId: 5, handleType: 0, routePath: '/tools/qrcode', description: '二维码生成与识别', descEn: 'Generate and scan QR codes', useCount: 9560, favorited: false },

  // F. 开发者工具类 (categoryId 6)
  { id: 28, toolKey: 'json-tool', name: 'JSON 工具', nameEn: 'JSON Tools', categoryId: 6, handleType: 0, routePath: '/tools/json-tool', description: 'JSON 格式化校验 + JSON↔YAML↔XML', descEn: 'Format/validate JSON + JSON↔YAML↔XML', useCount: 11240, favorited: false },
  { id: 29, toolKey: 'regex-test', name: '正则测试', nameEn: 'Regex Tester', categoryId: 6, handleType: 0, routePath: '/tools/regex-test', description: '实时测试与高亮正则匹配', descEn: 'Test and highlight regex matches live', useCount: 6630, favorited: false },
  { id: 30, toolKey: 'uuid', name: 'UUID 生成', nameEn: 'UUID Gen', categoryId: 6, handleType: 0, routePath: '/tools/uuid', description: '批量生成 UUID / GUID', descEn: 'Generate UUIDs / GUIDs in bulk', useCount: 5040, favorited: false },

  // G. 文本处理类 (categoryId 7)
  { id: 31, toolKey: 'word-count', name: '字数统计', nameEn: 'Word Count', categoryId: 7, handleType: 0, routePath: '/tools/word-count', description: '统计字符 / 词数 / 行数', descEn: 'Count characters, words and lines', useCount: 4180, favorited: false },

  // 二期联网工具（后端 V6 登记）
  { id: 32, toolKey: 'currency', name: '汇率换算', nameEn: 'Currency Converter', categoryId: 2, handleType: 1, routePath: '/tools/currency', description: '实时汇率，货币金额换算', descEn: 'Convert money between currencies at live rates', useCount: 3600, favorited: false },
  { id: 33, toolKey: 'weather', name: '天气查询', nameEn: 'Weather', categoryId: 1, handleType: 1, routePath: '/tools/weather', description: '查询城市实时天气与多天预报', descEn: 'Check live weather and multi-day forecast', useCount: 8800, favorited: false },
];

/**
 * toolKey → 搜索别名（中文俗称 / 英文 / 缩写），并入搜索匹配，提升可发现性。
 * 例：搜 "md5"、"qr"、"正则"、"时间戳" 也能命中对应工具。
 */
export const TOOL_ALIASES = {
  'phone-location': '手机号 归属地 运营商 号码 phone mobile carrier number',
  'ip-location': 'ip 归属地 地址 定位 address location',
  zipcode: '邮编 邮政编码 zip postal code',
  geocode: '经纬度 坐标 地址 地理编码 geocode coordinates latitude longitude lnglat',
  idcard: '身份证 校验 验证 id card identity 生日 性别',
  'unit-convert': '单位 换算 长度 重量 温度 面积 unit length weight temperature area',
  'radix-convert': '进制 二进制 十六进制 八进制 binary hex octal radix base',
  timestamp: '时间戳 时间 日期 unix epoch timestamp date time',
  'doc-convert': '文档 转换 word markdown pdf office doc convert',
  'color-convert': '颜色 转换 hex rgb hsl color',
  'pdf-merge': 'pdf 合并 merge combine join',
  'pdf-split': 'pdf 拆分 分割 提取 split extract',
  'pdf-watermark': 'pdf 水印 watermark',
  'pdf-encrypt': 'pdf 加密 解密 密码 encrypt decrypt password',
  'pdf-image': 'pdf 图片 转图片 image',
  'image-compress': '图片 压缩 体积 compress shrink',
  'image-convert': '图片 格式 转换 png jpg jpeg webp gif convert',
  'image-edit': '图片 编辑 裁剪 缩放 水印 crop resize edit',
  palette: '配色 调色板 色板 palette scheme',
  'china-color': '中国 传统色 国色 web安全色 chinese color',
  gradient: '渐变 css gradient',
  'text-crypto': '加密 解密 aes des rsa 文本 encrypt decrypt',
  hash: '哈希 摘要 md5 sha sha1 sha256 hmac digest',
  base64: 'base64 编码 解码 编解码 encode decode',
  'url-encode': 'url 编码 转义 urlencode escape unescape',
  'password-gen': '密码 生成 随机 password generate strong',
  qrcode: '二维码 扫码 识别 qr code scan',
  'json-tool': 'json 格式化 校验 yaml xml format validate beautify',
  'regex-test': '正则 表达式 匹配 regex regexp pattern',
  uuid: 'uuid guid 唯一 nanoid',
  'word-count': '字数 统计 词数 行数 word count character',
  'jwt-decode': 'jwt token 解析 decode',
  'case-convert': '命名 转换 驼峰 下划线 camel snake kebab case',
  'text-dedup': '去重 排序 dedup unique sort 文本',
  'text-diff': '对比 比较 差异 diff compare 文本',
  markdown: 'markdown md 预览 preview',
  'cron-parser': 'cron 表达式 定时 quartz schedule crontab',
  'chinese-convert': '简繁 繁简 简体 繁体 traditional simplified chinese',
  currency: '汇率 货币 换算 外汇 美元 人民币 欧元 exchange rate currency forex usd cny',
  weather: '天气 气温 温度 预报 湿度 风 weather forecast temperature',
};

/** 分类 code → 前端元数据（图标 / 强调色 / 英文名） */
export const CATEGORY_META = CATEGORIES_SEED.reduce((acc, c) => {
  acc[c.code] = { icon: c.icon, accent: c.accent, nameEn: c.nameEn };
  return acc;
}, {});

/** toolKey → 英文标签兜底 */
export const TOOL_I18N = TOOLS_SEED.reduce((acc, t) => {
  acc[t.toolKey] = { nameEn: t.nameEn, descEn: t.descEn };
  return acc;
}, {});

const FALLBACK_META = { icon: 'bolt', accent: 'var(--color-primary)' };

/** 后端分类 VO / 种子 → 组件统一结构 */
export function normalizeCategory(raw) {
  const meta = CATEGORY_META[raw.code] || FALLBACK_META;
  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    // 优先用后端下发的 nameEn（方案 B），缺失时回退本地映射，再回退中文
    nameEn: raw.nameEn || meta.nameEn || raw.name,
    icon: meta.icon || FALLBACK_META.icon,
    accent: meta.accent || FALLBACK_META.accent,
    sort: raw.sort,
    status: raw.status,
  };
}

/** 后端工具 VO / 种子 → 组件统一结构（categoriesById：id→规整后的分类） */
export function normalizeTool(raw, categoriesById = {}) {
  const cat = categoriesById[raw.categoryId];
  const i18n = TOOL_I18N[raw.toolKey] || {};
  const desc = raw.description != null ? raw.description : raw.desc;
  return {
    id: raw.id,
    toolKey: raw.toolKey,
    name: raw.name,
    // 优先后端 nameEn/descriptionEn（方案 B），缺失时回退本地映射，再回退中文
    nameEn: raw.nameEn || i18n.nameEn || raw.name,
    desc,
    descEn: raw.descriptionEn || i18n.descEn || desc,
    categoryId: raw.categoryId,
    categoryCode: cat ? cat.code : undefined,
    icon: cat ? cat.icon : FALLBACK_META.icon,
    accent: cat ? cat.accent : FALLBACK_META.accent,
    handleType: raw.handleType === 1 || raw.handleType === 'back' ? 'back' : 'front',
    routePath: raw.routePath,
    useCount: raw.useCount != null ? raw.useCount : 0,
    favorited: !!raw.favorited,
    aliases: TOOL_ALIASES[raw.toolKey] || '',
  };
}

/** 按语言取名称 / 描述（作用于规整后的对象） */
export function toolName(tool, lang) {
  return lang === 'en' ? tool.nameEn || tool.name : tool.name;
}
export function toolDesc(tool, lang) {
  return lang === 'en' ? tool.descEn || tool.desc : tool.desc;
}
export function catName(category, lang) {
  return lang === 'en' ? category.nameEn || category.name : category.name;
}

/**
 * 工具搜索匹配：跨中英名称/描述/别名,大小写不敏感。
 * kw 需调用方预先 trim + toLowerCase。
 */
export function toolMatch(tool, kw) {
  if (!kw) return true;
  const hay = `${tool.name || ''} ${tool.nameEn || ''} ${tool.desc || ''} ${tool.descEn || ''} ${tool.aliases || ''}`.toLowerCase();
  return hay.includes(kw);
}
