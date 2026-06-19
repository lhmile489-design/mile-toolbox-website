/**
 * 每个工具的专属 SVG 图标（24x24 viewBox，1.75 线性描边，与全局图标风格统一）。
 * 缺失时回退到分类图标（fallback）。
 */
import React from 'react';
import Icon from './Icons';

const P = {
  // —— 查询 ——
  'phone-location': (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" />
      <path d="M12 6.5l2.4 2.4M14.4 8.9c.9-.9.9-2.4 0-3.3" />
    </>
  ),
  'ip-location': (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.6 2.6 2.6 14.4 0 17M12 3.5c-2.6 2.6-2.6 14.4 0 17" />
    </>
  ),
  zipcode: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 5.5L20 7" />
    </>
  ),
  geocode: (
    <>
      <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2.3" />
    </>
  ),
  idcard: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="8.5" cy="11" r="2.1" />
      <path d="M13 10h5M13 13.5h4M5.4 15.6c.7-1.5 4.5-1.5 5.2 0" />
    </>
  ),

  // —— 转换 ——
  'unit-convert': (
    <>
      <rect x="2.5" y="8.5" width="19" height="7" rx="1.5" />
      <path d="M7 8.5v3M11 8.5v4M15 8.5v3M19 8.5v3" />
    </>
  ),
  'radix-convert': (
    <>
      <path d="M7.5 7.5v9M6 7.5h1.5M6 16.5h3" />
      <rect x="13.5" y="7.5" width="5" height="9" rx="2.5" />
    </>
  ),
  timestamp: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  'doc-convert': (
    <>
      <path d="M9 4H6a2 2 0 0 0-2 2v8" />
      <path d="M15 20h3a2 2 0 0 0 2-2V9" />
      <path d="M7 12h9m0 0-3-3m3 3-3 3" />
    </>
  ),
  'color-convert': (
    <>
      <path d="M12 3.5s6 6.3 6 10.3a6 6 0 1 1-12 0C6 9.8 12 3.5 12 3.5Z" />
      <path d="M9 14.5a3 3 0 0 0 3 3" />
    </>
  ),
  'chinese-convert': (
    <>
      <path d="M4 6h8M8 5.5c0 5-1.7 9-4.5 11" />
      <path d="M6 11c1.5 3 4 5.2 6.5 6.3" />
      <path d="m13.5 20 3.5-9 3.5 9M15 17.2h5" />
    </>
  ),

  // —— 文件 ——
  'pdf-merge': (
    <>
      <path d="M9.5 4H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      <rect x="11" y="7" width="9" height="13" rx="2" />
      <path d="M15.5 11v5M13 13.5h5" />
    </>
  ),
  'pdf-split': (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M3.5 12h17" strokeDasharray="2.4 2.4" />
    </>
  ),
  'pdf-watermark': (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M9 17 15 7" opacity="0.55" />
      <path d="M8.5 13.5 11 11M13 17l2.5-2.5" opacity="0.55" />
    </>
  ),
  'pdf-encrypt': (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <rect x="9" y="12" width="6" height="5" rx="1" />
      <path d="M10.3 12v-1.2a1.7 1.7 0 0 1 3.4 0V12" />
    </>
  ),
  'pdf-image': (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <circle cx="9.5" cy="9" r="1.3" />
      <path d="m7.5 17 2.8-3.3 2.2 2.2L15 12l1.5 5z" />
    </>
  ),
  'image-compress': (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M9 9 6.5 11.5 9 14M15 9l2.5 2.5L15 14" />
    </>
  ),
  'image-convert': (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8" cy="10" r="1.4" />
      <path d="m5 17 4.2-4 2.3 2.3" />
      <path d="M16 7.5h3.5m0 0-2-2m2 2-2 2" />
    </>
  ),
  'image-edit': (
    <>
      <path d="M19 11.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6.5" />
      <circle cx="8.5" cy="10" r="1.3" />
      <path d="m5.5 17.5 3.5-3.3 2 2" />
      <path d="m16.5 4 3.5 3.5-5 5-3.5.5.5-3.5z" />
    </>
  ),

  // —— 设计配色 ——
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.5-1.1-.3-.3-.4-.7-.4-1 0-.8.6-1.4 1.4-1.4H16a5 5 0 0 0 5-5c0-4.4-4-8-9-8Z" />
      <circle cx="7.7" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="11" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  'china-color': (
    <>
      <path d="M9.5 14.5 4.5 19.5c1.5 1.2 3.6.9 4.8-.3l1.4-1.4" />
      <path d="m11 13 7-7a2 2 0 0 1 3 3l-7 7z" />
    </>
  ),
  gradient: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <path d="m19 5-14 14" opacity="0.5" />
      <path d="m19 10-9 9M19 15l-4 4" opacity="0.3" />
    </>
  ),

  // —— 加密编码 ——
  'text-crypto': (
    <>
      <path d="M12 3 5 6v5c0 4.4 3 7.4 7 8.5 4-1.1 7-4.1 7-8.5V6z" />
      <path d="M9 10.5h6M9 13.5h4" />
    </>
  ),
  hash: (
    <>
      <path d="M9 4 7 20M17 4l-2 16M4 9.5h15M3.5 14.5h15" />
    </>
  ),
  base64: (
    <>
      <path d="M8.5 4C6.5 4 6.5 7 6.5 8.5s0 2.5-2 3.5c2 1 2 2 2 3.5S6.5 20 8.5 20" />
      <path d="M15.5 4c2 0 2 3 2 4.5s0 2.5 2 3.5c-2 1-2 2-2 3.5s0 4.5-2 4.5" />
      <path d="M11 11h2M11 14h2" />
    </>
  ),
  'url-encode': (
    <>
      <path d="M10.5 13.5 13.5 10.5" />
      <path d="M8.5 12 6.5 14a3 3 0 0 0 4.2 4.2l2-2" />
      <path d="M15.5 12l2-2a3 3 0 0 0-4.2-4.2l-2 2" />
    </>
  ),
  'password-gen': (
    <>
      <circle cx="8.5" cy="8.5" r="4" />
      <path d="m11.5 11.5 7 7M16 16l1.8-1.8M18.3 18.3l1.8-1.8" />
    </>
  ),
  qrcode: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14h2.5v2.5M20 14v2.5M14 20h2.5M20 18.5V20h-1.5" />
    </>
  ),

  // —— 开发者 ——
  'json-tool': (
    <>
      <path d="M9 4C7 4 7 7 7 8.5S7 11 5 12c2 1 2 2.5 2 3.5S7 20 9 20" />
      <path d="M15 4c2 0 2 3 2 4.5s0 2.5 2 3.5c-2 1-2 2.5-2 3.5s0 4.5-2 4.5" />
      <circle cx="12" cy="12" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  'regex-test': (
    <>
      <path d="M12 5v8M8.5 7l7 4M15.5 7l-7 4" />
      <circle cx="7" cy="17" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  uuid: (
    <>
      <rect x="3" y="7" width="18" height="10" rx="3.5" />
      <path d="M7.5 12h.01M12 12h.01M16.5 12h.01" />
    </>
  ),
  'jwt-decode': (
    <>
      <path d="M12 3.5v17" />
      <path d="M7.5 7 5.5 12l2 5M16.5 7l2 5-2 5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  'case-convert': (
    <>
      <path d="m3 17 3.3-8.5L9.5 17M4.3 14h4.4" />
      <path d="M14 11.8a2.4 2.4 0 0 1 4.8 0V17M14 14.8c0 2 4.8 2 4.8 0" />
    </>
  ),
  'cron-parser': (
    <>
      <circle cx="11" cy="13" r="7" />
      <path d="M11 9.5V13l2.5 1.5" />
      <path d="M17 4.5 19.5 6 18 8" />
      <path d="M19.5 6c-1.6-1.2-3.6-1.8-5.5-1.6" />
    </>
  ),

  // —— 文本 ——
  'word-count': (
    <>
      <path d="M4 6h16M4 11h12M4 16h8" />
      <path d="M14.5 19 17 13l2.5 6M15.3 17.2h3.4" />
    </>
  ),
  'text-dedup': (
    <>
      <path d="M4 6h13M4 12h8M4 18h13" />
      <path d="m15 11.5 2 2 4-4" />
    </>
  ),
  'text-diff': (
    <>
      <rect x="3" y="4" width="7" height="16" rx="1.5" />
      <rect x="14" y="4" width="7" height="16" rx="1.5" />
      <path d="M5 8.5h3M16 8.5h3M16 12h3" />
    </>
  ),
  markdown: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <path d="M6.5 15v-6l3 3 3-3v6" />
      <path d="M16.5 9v4.5M16.5 13.5 15 12M16.5 13.5 18 12" />
    </>
  ),
};

export default function ToolIcon({ toolKey, fallback, size = 24, className, strokeWidth = 1.75, ...rest }) {
  const content = P[toolKey];
  if (!content) return <Icon name={fallback || 'bolt'} size={size} className={className} {...rest} />;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {content}
    </svg>
  );
}
