/**
 * 工具组件注册表（按需懒加载 React.lazy）。
 * 每个工具单独成 chunk，crypto-js / qrcode / markdown-it / opencc-js / diff 等大库
 * 只在打开对应工具时才加载，显著减小首屏体积。
 */
import { lazy } from 'react';

const loaders = {
  base64: () => import('./Base64'),
  'url-encode': () => import('./UrlEncode'),
  uuid: () => import('./Uuid'),
  'word-count': () => import('./WordCount'),
  timestamp: () => import('./Timestamp'),
  'radix-convert': () => import('./RadixConvert'),
  'password-gen': () => import('./PasswordGen'),
  'json-tool': () => import('./JsonTool'),
  'regex-test': () => import('./RegexTest'),
  'color-convert': () => import('./ColorConvert'),
  gradient: () => import('./Gradient'),
  hash: () => import('./Hash'),
  'text-crypto': () => import('./TextCrypto'),
  qrcode: () => import('./Qrcode'),
  idcard: () => import('./Idcard'),
  'unit-convert': () => import('./UnitConvert'),
  'image-compress': () => import('./ImageCompress'),
  'image-edit': () => import('./ImageEdit'),
  palette: () => import('./Palette'),
  'china-color': () => import('./ChinaColor'),
  geocode: () => import('./Geocode'),
  'ip-location': () => import('./IpLocation'),
  'phone-location': () => import('./PhoneLocation'),
  zipcode: () => import('./Zipcode'),
  currency: () => import('./Currency'),
  weather: () => import('./Weather'),
  'jwt-decode': () => import('./JwtDecode'),
  'case-convert': () => import('./CaseConvert'),
  'text-dedup': () => import('./TextDedup'),
  'text-diff': () => import('./TextDiff'),
  markdown: () => import('./Markdown'),
  'cron-parser': () => import('./CronParser'),
  'chinese-convert': () => import('./ChineseConvert'),
};

const cache = {};

export function getToolComponent(toolKey) {
  if (!loaders[toolKey]) return null;
  if (!cache[toolKey]) cache[toolKey] = lazy(loaders[toolKey]);
  return cache[toolKey];
}
