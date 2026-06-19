/**
 * 异步文件任务框架接口（对接文档 §9：提交 → 轮询 → 下载）。
 * 面向耗时工具（如二期视频转码）。现有同步 PDF/图片/文档仍用各自端点，不走此框架。
 *
 *  提交：POST /file/async/<xxx>（multipart）→ Result<taskId 字符串>
 *  轮询：GET  /file/task/{taskId}      → AsyncTaskVO
 *  下载：GET  /file/download/{taskId}  → COS 走 302 / 本地走 blob
 */
import { API_BASE } from './config';
import { getToken, clearAuth } from './auth';
import { ApiError, get } from './http';
import { downloadBlob } from './pdf';

/** 任务状态常量（对齐后端 status 语义） */
export const TASK_STATUS = {
  SUCCESS: 0,
  FAILED: 1,
  PENDING: 2,
  PROCESSING: 3,
};

/** 是否终态（成功/失败） */
export const isTerminal = (status) => status === TASK_STATUS.SUCCESS || status === TASK_STATUS.FAILED;

/**
 * 通用异步任务提交：multipart 上传，返回 taskId 字符串。
 * @param {string} path 提交端点（如 '/file/async/echo'）
 * @param {FormData} formData 已组装的表单
 */
export async function submitAsyncTask(path, formData) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = token; // 带 token 计入个人使用历史

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: formData });
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
  if (code === '200') return payload.data; // taskId
  if (code === '10005') {
    clearAuth();
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('mile:unauthorized'));
  }
  throw new ApiError(code, payload.msg);
}

/** 演示端点：原样回显上传文件（验证异步链路用） */
export function submitAsyncEcho(file) {
  const fd = new FormData();
  fd.append('file', file);
  return submitAsyncTask('/file/async/echo', fd);
}

/** GET /file/task/{taskId} 轮询任务状态（建议 1-2 秒/次，直到终态） */
export const fetchTaskStatus = (taskId) => get(`/file/task/${encodeURIComponent(taskId)}`);

/** 从 Content-Disposition 解析文件名 */
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

/**
 * 下载任务产物。
 * - 任务带 resultUrl（启用 COS）→ 直接用该直链触发下载，避免跨域 fetch。
 * - 否则请求 /file/download/{taskId} 取本地 blob 下载；JSON 则按错误码抛出。
 * @param {object} task AsyncTaskVO（至少含 taskId；可含 resultUrl/resultName）
 */
export async function downloadTaskResult(task) {
  if (task && task.resultUrl) {
    const a = document.createElement('a');
    a.href = task.resultUrl;
    a.target = '_blank';
    a.rel = 'noopener';
    if (task.resultName) a.download = task.resultName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }

  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = token;

  let res;
  try {
    res = await fetch(`${API_BASE}/file/download/${encodeURIComponent(task.taskId)}`, { headers });
  } catch (e) {
    throw new ApiError('NETWORK', e.message || 'Network error');
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    let payload;
    try {
      payload = await res.json();
    } catch (e) {
      throw new ApiError('NETWORK', `HTTP ${res.status}`);
    }
    throw new ApiError(String(payload.code), payload.msg);
  }
  if (!res.ok) throw new ApiError('NETWORK', `HTTP ${res.status}`);

  const blob = await res.blob();
  const filename = parseFilename(res.headers.get('content-disposition')) || task.resultName || 'download';
  downloadBlob(blob, filename);
}
