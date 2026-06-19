import React, { useCallback, useRef, useState } from 'react';
import Icon from '../components/Icons';
import { reportToolUse } from '../api/tools';
import { useLang } from '../i18n/LanguageContext';

/** 简易双语取值：L(lang, 中文, English) */
export const L = (lang, zh, en) => (lang === 'en' ? en : zh);

/**
 * 使用上报：前端工具「处理完成」时调用一次（每次进入工具页只上报一次，避免刷量）。
 * 返回 report()，工具在主操作成功后调用。
 */
export function useReportOnce(toolKey) {
  const done = useRef(false);
  return useCallback(() => {
    if (done.current) return;
    done.current = true;
    reportToolUse(toolKey).catch(() => {
      /* 上报失败不影响工具使用 */
    });
  }, [toolKey]);
}

/** 复制按钮（带「已复制」反馈） */
export function CopyButton({ text, small = false }) {
  const { lang } = useLang();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // 退化方案
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        /* ignore */
      }
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <button type="button" className={`tui-copy ${small ? 'tui-copy--sm' : ''}`} onClick={onCopy} disabled={!text}>
      <Icon name={copied ? 'check' : 'copy'} size={14} />
      {copied ? L(lang, '已复制', 'Copied') : L(lang, '复制', 'Copy')}
    </button>
  );
}

/** 工具区块：标题 + 内容 */
export function ToolBlock({ label, children, actions }) {
  return (
    <div className="tui-block">
      {(label || actions) && (
        <div className="tui-block__head">
          {label && <span className="tui-block__label">{label}</span>}
          {actions && <div className="tui-block__actions">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/** 点击复制的色卡 */
export function ColorSwatch({ color, name }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(color);
    } catch (e) {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button type="button" className="swatch" onClick={copy} title={`${name || ''} ${color}`}>
      <span className="swatch__color" style={{ background: color }} />
      <span className="swatch__meta">
        {name && <span className="swatch__name">{name}</span>}
        <span className="swatch__hex mono">{copied ? '✓' : color}</span>
      </span>
    </button>
  );
}
