import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icons';
import { toolName } from '../data/tools';
import { useToolData } from '../data/ToolDataContext';
import { useLang } from '../i18n/LanguageContext';

const POPULAR_KEYS = ['json-tool', 'pdf-merge', 'qrcode', 'base64', 'timestamp'];

export default function Hero({ onSearch, onLiveSearch }) {
  const { t, lang } = useLang();
  const { tools, categories } = useToolData();
  const [q, setQ] = useState('');
  const inputRef = useRef(null);

  const frontCount = tools.filter((tool) => tool.handleType === 'front').length;
  const popular = POPULAR_KEYS.map((key) => tools.find((tool) => tool.toolKey === key)).filter(Boolean);

  // "/" 快捷键聚焦搜索框
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (document.activeElement && document.activeElement.isContentEditable)) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onChange = (v) => {
    setQ(v);
    onLiveSearch?.(v); // 即时过滤（不滚动）
  };
  const submit = (e) => {
    e.preventDefault();
    onSearch?.(q.trim());
  };
  const clear = () => {
    setQ('');
    onLiveSearch?.('');
    inputRef.current?.focus();
  };

  return (
    <section className="hero" id="top">
      <div className="hero__glow" aria-hidden="true" />
      <div className="container hero__inner reveal">
        <img
          className="hero__appicon"
          src={`${process.env.PUBLIC_URL}/appIcon.png`}
          alt="Mile"
          width="76"
          height="76"
        />
        <span className="hero__eyebrow mono">
          <Icon name="bolt" size={14} />
          {t('hero.eyebrow')}
        </span>

        <h1 className="hero__title">
          {t('hero.titleLine1')}
          <br />
          {t('hero.titleLine2')}
          <span className="hero__title-accent">{t('hero.titleAccent')}</span>
        </h1>

        <p className="hero__subtitle">{t('hero.subtitle')}</p>

        <form className="hero__search" onSubmit={submit} role="search">
          <Icon name="search" size={20} className="hero__search-icon" />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('hero.searchPlaceholder')}
            aria-label={t('hero.searchAria')}
          />
          {q && (
            <button type="button" className="hero__search-clear" onClick={clear} aria-label={t('common.clear') || 'clear'}>
              <Icon name="close" size={16} />
            </button>
          )}
          <button type="submit" className="btn btn--cta">
            {t('hero.searchBtn')}
            <Icon name="arrow" size={18} />
          </button>
        </form>

        <div className="hero__tags">
          <span className="hero__tags-label mono">{t('hero.popularLabel')}</span>
          {popular.map((tool) => {
            const label = toolName(tool, lang);
            return (
              <button
                key={tool.toolKey}
                type="button"
                className="hero__tag"
                onClick={() => {
                  setQ(label);
                  onSearch?.(label);
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <dl className="hero__stats">
          <div className="hero__stat">
            <dt className="hero__stat-num mono">{tools.length}</dt>
            <dd>{t('hero.statTools')}</dd>
          </div>
          <div className="hero__stat">
            <dt className="hero__stat-num mono">{categories.length}</dt>
            <dd>{t('hero.statCategories')}</dd>
          </div>
          <div className="hero__stat">
            <dt className="hero__stat-num mono">{frontCount}</dt>
            <dd>{t('hero.statLocal')}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
