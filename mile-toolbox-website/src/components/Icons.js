/**
 * 统一 SVG 图标集（24x24 viewBox，1.75 描边）。
 * 全站只用本图标集，禁止用 emoji 当图标。
 */
import React from 'react';

const paths = {
  // 分类图标
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  convert: <><path d="M7 10h13l-3-3" /><path d="M17 14H4l3 3" /></>,
  file: (
    <>
      <path d="M14 3v5h5" />
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.4-.15-.74-.4-1-.24-.27-.39-.62-.39-1 0-.83.67-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.42-4.03-8-9-8Z" />
      <circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10" width="15" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  code: <><path d="m8 7-5 5 5 5" /><path d="m16 7 5 5-5 5" /></>,
  text: <><path d="M5 6h14" /><path d="M5 12h14" /><path d="M5 18h9" /></>,

  // 功能图标
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  bolt: <path d="M13 3 4 14h7l-1 7 9-11h-7z" />,
  fire: (
    <path d="M12 3c1.5 3 4.5 4.5 4.5 8.5A4.5 4.5 0 0 1 12 16a4.5 4.5 0 0 1-4.5-4.5c0-1.4.6-2.4 1.3-3.2.2 1 .9 1.7 1.7 1.7-.5-2 .6-4 1.5-4.7Z" />
  ),
  star: <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8z" />,
  'star-outline': <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8z" />,
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 4v4h4" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  shield: <path d="M12 3 5 6v5c0 4 3 7 7 8 4-1 7-4 7-8V6z" />,
  server: (
    <>
      <rect x="4" y="4" width="16" height="7" rx="2" />
      <rect x="4" y="13" width="16" height="7" rx="2" />
      <path d="M8 7.5h.01M8 16.5h.01" />
    </>
  ),
  device: (
    <>
      <rect x="4" y="4" width="16" height="12" rx="2" />
      <path d="M9 20h6M12 16v4" />
    </>
  ),
  check: <path d="m5 13 4 4 10-10" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </>
  ),
  refresh: (
    <>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 4v4h-4" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 20v-4h4" />
    </>
  ),
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  github: (
    <path d="M12 3a9 9 0 0 0-2.8 17.5c.45.1.6-.2.6-.43v-1.5c-2.5.55-3-1.2-3-1.2-.4-1-1-1.3-1-1.3-.8-.55.06-.54.06-.54.9.06 1.4.92 1.4.92.8 1.4 2.1 1 2.6.76.08-.6.32-1 .58-1.23-2-.23-4.1-1-4.1-4.45 0-.98.35-1.78.92-2.4-.1-.24-.4-1.16.08-2.4 0 0 .76-.25 2.5.92a8.6 8.6 0 0 1 4.5 0c1.74-1.17 2.5-.92 2.5-.92.48 1.24.18 2.16.09 2.4.57.62.91 1.42.91 2.4 0 3.46-2.1 4.22-4.1 4.44.33.28.61.83.61 1.67v2.47c0 .24.15.54.62.44A9 9 0 0 0 12 3Z" />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.5 2.5 15 0 18-2.5-3-2.5-15.5 0-18Z" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 12H3m0 0 3-3m-3 3 3 3" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />,
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
    </>
  ),
  share: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" />
    </>
  ),
  download: <><path d="M12 4v11m0 0 4-4m-4 4-4-4" /><path d="M5 19h14" /></>,
  'corner-down-left': <><path d="M9 10 5 14l4 4" /><path d="M5 14h10a4 4 0 0 0 4-4V5" /></>,
};

export default function Icon({ name, size = 24, className, strokeWidth = 1.75, ...rest }) {
  const content = paths[name];
  if (!content) return null;
  const fillIcons = ['bolt', 'fire', 'star', 'shield', 'github'];
  const isFilled = fillIcons.includes(name);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isFilled ? 'currentColor' : 'none'}
      stroke={isFilled ? 'none' : 'currentColor'}
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
