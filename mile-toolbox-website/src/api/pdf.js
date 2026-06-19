/**
 * PDF 文件工具接口（对接文档：前台-PDF文件工具-对接文档.md）。
 * multipart 上传，成功直接返回二进制流（PDF/ZIP），失败返回标准 JSON Result。
 * 用 fetch 取 blob；若响应是 application/json 则解析为 ApiError（按错误码提示）。
 */
import { API_BASE } from './config';
import { getToken, clearAuth } from './auth';
import { ApiError } from './http';

/**
 * 提交文件处理。
 * - 默认（save 省略/false）：成功返回 { kind:'blob', blob, filename }
 * - save=true：成功返回 { kind:'url', url, filename, size }（COS 未配置时后端回退为 blob）
 * 失败抛 ApiError。
 * @param {string} path  接口路径，如 '/pdf/merge'
 * @param {FormData} formData  已组装好的表单（save 由调用方按需 append）
 */
export async function postFileProcess(path, formData) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = token; // 带 token 计入个人使用历史

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: formData });
  } catch (e) {
    throw new ApiError('NETWORK', e.message || 'Network error');
  }

  const contentType = res.headers.get('content-type') || '';

  // JSON：可能是 save 模式结果（code 200 + data.url）或错误
  if (contentType.includes('application/json')) {
    let payload;
    try {
      payload = await res.json();
    } catch (e) {
      throw new ApiError('NETWORK', `HTTP ${res.status}`);
    }
    const code = String(payload.code);
    if (code === '200') {
      const data = payload.data || {};
      return { kind: 'url', url: data.url, filename: data.filename, size: data.size };
    }
    if (code === '10005') {
      clearAuth();
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('mile:unauthorized'));
    }
    throw new ApiError(code, payload.msg);
  }

  if (!res.ok) throw new ApiError('NETWORK', `HTTP ${res.status}`);

  // 二进制流
  const blob = await res.blob();
  const filename = parseFilename(res.headers.get('content-disposition'));
  return { kind: 'blob', blob, filename };
}

/** 从 Content-Disposition 解析文件名（兼容 filename* 与普通 filename） */
function parseFilename(disposition) {
  if (!disposition) return '';
  const star = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(disposition);
  if (star && star[1]) {
    try {
      return decodeURIComponent(star[1].replace(/"/g, '').trim());
    } catch (e) {
      /* ignore */
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(disposition);
  return plain ? plain[1].trim() : '';
}

/** 触发浏览器下载一个 Blob */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
