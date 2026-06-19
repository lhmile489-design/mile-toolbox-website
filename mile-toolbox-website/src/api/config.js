/**
 * API 基址。
 * - 开发：REACT_APP_API_BASE 留空 → 相对路径，由 CRA proxy 转发到后端（见 package.json）。
 * - 生产：设为后端完整地址，或留空走同源反向代理。
 */
export const API_BASE = (process.env.REACT_APP_API_BASE || '').replace(/\/$/, '');
