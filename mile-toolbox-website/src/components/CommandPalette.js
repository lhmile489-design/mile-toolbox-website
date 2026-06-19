import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icons';
import ToolIcon from './ToolIcon';
import { toolName, toolDesc, toolMatch } from '../data/tools';
import { useToolData } from '../data/ToolDataContext';
import { useLang } from '../i18n/LanguageContext';
import { getRecent } from '../utils/recent';
import { L } from '../tools/ui';

const Ctx = createContext(null);

export function useCommandPalette() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  return ctx;
}

export function CommandPaletteProvider({ children }) {
  const [open, setOpen] = useState(false);
  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);

  // 全局 Ctrl/Cmd+K 唤起
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo(() => ({ open, openPalette, closePalette }), [open, openPalette, closePalette]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {open && <CommandPalette onClose={closePalette} />}
    </Ctx.Provider>
  );
}

function CommandPalette({ onClose }) {
  const { t, lang } = useLang();
  const { tools, favorites, hot } = useToolData();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const kw = q.trim().toLowerCase();

  // 分组结果：有关键词 → 单组匹配；无关键词 → 最近使用 + 收藏（兜底热门）
  const groups = useMemo(() => {
    if (kw) {
      const items = tools.filter((tl) => toolMatch(tl, kw)).slice(0, 50);
      return [{ key: 'result', label: t('palette.results'), items }];
    }
    const byKey = (k) => tools.find((tl) => tl.toolKey === k);
    const recent = getRecent().map(byKey).filter(Boolean).slice(0, 6);
    const out = [];
    if (recent.length) out.push({ key: 'recent', label: t('palette.recent'), items: recent });
    if (favorites.length) out.push({ key: 'fav', label: t('palette.favorites'), items: favorites.slice(0, 8) });
    if (!out.length) out.push({ key: 'hot', label: t('palette.suggested'), items: hot.slice(0, 8) });
    return out;
  }, [kw, tools, favorites, hot, t]);

  // 展平用于键盘导航
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => {
    setActive(0);
  }, [kw]);

  useEffect(() => {
    inputRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  const go = useCallback(
    (tool) => {
      if (!tool) return;
      onClose();
      navigate(tool.routePath);
    },
    [navigate, onClose]
  );

  // 高亮项滚动到可视区
  useEffect(() => {
    const node = listRef.current?.querySelector(`[data-idx="${active}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (flat.length ? (i + 1) % flat.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(flat[active]);
    }
  };

  let idx = -1;

  return (
    <div className="cmdk" role="dialog" aria-modal="true" aria-label={t('palette.title')} onMouseDown={onClose}>
      <div className="cmdk__panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cmdk__search">
          <Icon name="search" size={18} className="cmdk__search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cmdk__input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('palette.placeholder')}
            aria-label={t('palette.placeholder')}
          />
          <button type="button" className="cmdk__esc" onClick={onClose}>ESC</button>
        </div>

        <div className="cmdk__list" ref={listRef}>
          {flat.length === 0 ? (
            <div className="cmdk__empty">
              <Icon name="search" size={26} />
              <p>{t('palette.empty')}</p>
            </div>
          ) : (
            groups.map((g) => (
              <div className="cmdk__group" key={g.key}>
                <div className="cmdk__group-label mono">{g.label}</div>
                {g.items.map((tool) => {
                  idx += 1;
                  const i = idx;
                  return (
                    <button
                      type="button"
                      key={tool.toolKey}
                      data-idx={i}
                      className={`cmdk__item ${i === active ? 'is-active' : ''}`}
                      style={{ '--accent': tool.accent }}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(tool)}
                    >
                      <span className="cmdk__item-icon" aria-hidden="true">
                        <ToolIcon toolKey={tool.toolKey} fallback={tool.icon} size={18} />
                      </span>
                      <span className="cmdk__item-text">
                        <span className="cmdk__item-name">{toolName(tool, lang)}</span>
                        <span className="cmdk__item-desc">{toolDesc(tool, lang)}</span>
                      </span>
                      <span className={`cmdk__item-badge ${tool.handleType === 'front' ? 'is-local' : 'is-cloud'}`}>
                        {tool.handleType === 'front' ? t('tools.badgeLocal') : t('tools.badgeCloud')}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="cmdk__foot mono">
          <span><kbd>↑</kbd><kbd>↓</kbd> {L(lang, '选择', 'navigate')}</span>
          <span><kbd><Icon name="corner-down-left" size={12} /></kbd> {L(lang, '打开', 'open')}</span>
          <span><kbd>esc</kbd> {L(lang, '关闭', 'close')}</span>
        </div>
      </div>
    </div>
  );
}
