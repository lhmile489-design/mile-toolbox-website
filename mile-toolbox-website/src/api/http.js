/**
 * 统一请求封装（fetch）。对接「错误码与响应规范」：
 *  - 响应体 { code, msg, data }；code === "200" 取 data，否则抛 ApiError。
 *  - 登录失效（code === "10005"）：清登录态并广播 'mile:unauthorized'，由 AuthContext 跳登录。
 *  - 请求头自动带 Authorization: <token>（存在时；公开接口带 token 后端做个性化）。
 */
import { API_BASE } from './config';
import { getToken, clearAuth } from './auth';

export class ApiError extends Error {
  constructor(code, msg) {
    super(msg || 'Request failed');
    this.name = 'ApiError';
    this.code = code;
  }
}

function buildQuery(params) {
  if (!params) return '';
  const usp = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== '') usp.append(key, val);
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

export async function request(path, { method = 'GET', body, params } = {}) {
  const url = `${API_BASE}${path}${buildQuery(params)}`;
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = token;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new ApiError('NETWORK', e.message || 'Network error');
  }

  let payload;
  try {
    payload = await res.json();
  } catch (e) {
    throw new ApiError('NETWORK', `HTTP ${res.status}`);
  }

  const code = String(payload.code);
  if (code === '200') return payload.data;

  if (code === '10005') {
    clearAuth();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mile:unauthorized'));
    }
  }
  throw new ApiError(code, payload.msg);
}

export const get = (path, options) => request(path, { ...options, method: 'GET' });
export const post = (path, body, options) => request(path, { ...options, method: 'POST', body });
export const put = (path, body, options) => request(path, { ...options, method: 'PUT', body });
export const del = (path, options) => request(path, { ...options, method: 'DELETE' });
