import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icons';
import { L } from '../tools/ui';
import { useLang } from '../i18n/LanguageContext';
import { fetchTaskStatus, downloadTaskResult, isTerminal, TASK_STATUS } from '../api/asyncTask';

/**
 * 通用异步文件任务执行器（对接文档 §9：提交 → 轮询 → 下载）。
 * 供耗时工具复用：传入 submitFn(file) 返回 taskId 即可。
 *
 * @param {(file: File) => Promise<string>} submitFn 提交函数，返回 taskId
 * @param {string} [accept] 文件 input 的 accept
 * @param {number} [pollInterval=1500] 轮询间隔(ms)
 */
export default function AsyncTaskRunner({ submitFn, accept, pollInterval = 1500 }) {
  const { lang } = useLang();
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [task, setTask] = useState(null); // AsyncTaskVO
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const aliveRef = useRef(true);

  const mapError = useCallback(
    (e) => {
      const m = {
        10001: L(lang, '参数有误，请检查文件', 'Invalid input, check the file'),
        10300: L(lang, '文件不能为空', 'File cannot be empty'),
        10301: L(lang, '不支持的文件类型', 'Unsupported file type'),
        10302: L(lang, '文件超过大小限制', 'File exceeds size limit'),
        10304: L(lang, '处理失败或产物已过期', 'Processing failed or result expired'),
        10305: L(lang, '任务不存在或已过期', 'Task not found or expired'),
        10306: L(lang, '操作过于频繁，请稍后再试', 'Too many requests, try again later'),
        10005: L(lang, '请先登录', 'Please sign in first'),
        NETWORK: L(lang, '网络异常，请稍后重试', 'Network error, please try again'),
      };
      return m[e.code] || e.message || L(lang, '处理失败', 'Failed');
    },
    [lang]
  );

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 轮询循环（setTimeout 递归，避免请求堆积）
  const poll = useCallback(
    async (taskId) => {
      try {
        const vo = await fetchTaskStatus(taskId);
        if (!aliveRef.current) return;
        setTask(vo);
        if (isTerminal(vo.status)) {
          stopPolling();
          if (vo.status === TASK_STATUS.FAILED) {
            setError(vo.errorMsg || L(lang, '处理失败', 'Processing failed'));
          }
          return;
        }
      } catch (e) {
        if (!aliveRef.current) return;
        stopPolling();
        setError(mapError(e));
        return;
      }
      timerRef.current = setTimeout(() => poll(taskId), pollInterval);
    },
    [pollInterval, stopPolling, mapError, lang]
  );

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting || !file) return;
    stopPolling();
    setError('');
    setTask(null);
    setSubmitting(true);
    try {
      const taskId = await submitFn(file);
      if (!aliveRef.current) return;
      setTask({ taskId, status: TASK_STATUS.PENDING, progress: 0 });
      poll(taskId);
    } catch (err) {
      setError(mapError(err));
    } finally {
      if (aliveRef.current) setSubmitting(false);
    }
  };

  const onDownload = async () => {
    try {
      await downloadTaskResult(task);
    } catch (e) {
      setError(mapError(e));
    }
  };

  const reset = () => {
    stopPolling();
    setTask(null);
    setError('');
    setFile(null);
    setSubmitting(false);
  };

  const status = task ? task.status : null;
  const progress = task && task.progress != null ? task.progress : 0;
  const running = task && !isTerminal(status);
  const success = status === TASK_STATUS.SUCCESS;

  const statusLabel = () => {
    switch (status) {
      case TASK_STATUS.PENDING:
        return L(lang, '排队中…', 'Pending…');
      case TASK_STATUS.PROCESSING:
        return L(lang, '处理中…', 'Processing…');
      case TASK_STATUS.SUCCESS:
        return L(lang, '处理完成', 'Done');
      case TASK_STATUS.FAILED:
        return L(lang, '处理失败', 'Failed');
      default:
        return '';
    }
  };

  return (
    <div className="tui async-runner">
      <form className="tui-row" onSubmit={onSubmit} style={{ alignItems: 'flex-end' }}>
        <label className="tui-field" style={{ flex: 1, minWidth: 200 }}>
          <span className="tui-label">{L(lang, '选择文件', 'Choose a file')}</span>
          <input
            className="tui-input"
            type="file"
            accept={accept}
            onChange={(e) => {
              setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null);
              setTask(null);
              setError('');
            }}
          />
        </label>
        <button type="submit" className="btn btn--cta" disabled={submitting || running || !file} style={{ alignSelf: 'flex-end' }}>
          {submitting ? L(lang, '提交中…', 'Submitting…') : L(lang, '开始处理', 'Process')}
        </button>
      </form>

      {error && <div className="tui-error">{error}</div>}

      {task && !error && (
        <div className={`async-task ${success ? 'is-done' : ''}`}>
          <div className="async-task__head">
            <span className="async-task__status">
              {running && <span className="tool-spinner" aria-hidden="true" />}
              {success && <Icon name="check" size={16} />}
              {statusLabel()}
            </span>
            <span className="async-task__pct mono">{progress}%</span>
          </div>
          <div className="async-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <span className="async-progress__bar" style={{ width: `${progress}%` }} />
          </div>

          {success && (
            <div className="async-task__actions">
              <button type="button" className="btn btn--primary" onClick={onDownload}>
                <Icon name="download" size={16} />
                {L(lang, '下载产物', 'Download result')}
                {task.resultName ? ` · ${task.resultName}` : ''}
              </button>
              <button type="button" className="btn btn--ghost" onClick={reset}>
                {L(lang, '再处理一个', 'Process another')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
