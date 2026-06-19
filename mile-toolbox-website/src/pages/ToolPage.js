import React, { Suspense, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icons';
import PdfToolRunner from '../components/PdfToolRunner';
import ToolIcon from '../components/ToolIcon';
import ToolCard from '../components/ToolCard';
import ErrorBoundary from '../components/ErrorBoundary';
import Reveal from '../components/Reveal';
import { recordRecent } from '../utils/recent';
import { toolName, toolDesc, catName } from '../data/tools';
import { isPdfTool } from '../data/pdfTools';
import { getToolComponent } from '../tools/registry';
import { useToolData } from '../data/ToolDataContext';
import { useAuth } from '../auth/AuthContext';
import { useAuthModal } from '../components/AuthModalProvider';
import { useToast } from '../components/Toast';
import { useLang } from '../i18n/LanguageContext';

export default function ToolPage() {
  const { toolKey } = useParams();
  const { t, lang } = useLang();
  const { tools, categories, loading, toggleFavorite } = useToolData();
  const { isAuthenticated } = useAuth();
  const { open } = useAuthModal();
  const toast = useToast();

  const tool = tools.find((item) => item.toolKey === toolKey);

  useEffect(() => {
    if (!tool) return undefined;
    recordRecent(tool.toolKey);
    document.title = `${toolName(tool, lang)} · ${t('nav.brandName')}`;
    return () => {
      document.title = t('documentTitle');
    };
  }, [tool, lang, t]);

  // 工具不存在（且已加载完成）
  if (!tool && !loading) {
    return (
      <section className="tool-page">
        <div className="container">
          <Link to="/" className="tool-page__back">
            <Icon name="arrow" size={16} className="tool-page__back-icon" />
            {t('tool.back')}
          </Link>
          <div className="tool-page__empty">
            <Icon name="search" size={32} />
            <h1 className="tool-page__empty-title">{t('tool.notFoundTitle')}</h1>
            <p>{t('tool.notFoundText')}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!tool) {
    return (
      <section className="tool-page">
        <div className="container">
          <div className="tool-page__empty">
            <Icon name="bolt" size={28} />
          </div>
        </div>
      </section>
    );
  }

  const onFav = async () => {
    if (!isAuthenticated) {
      open('login');
      return;
    }
    try {
      await toggleFavorite(tool);
    } catch (e) {
      /* 回滚已在 context 处理 */
    }
  };

  const isLocal = tool.handleType === 'front';
  const LocalTool = getToolComponent(tool.toolKey);
  const category = categories.find((c) => c.code === tool.categoryCode);
  const related = tools.filter((it) => it.categoryCode === tool.categoryCode && it.toolKey !== tool.toolKey).slice(0, 6);

  const onShare = async () => {
    const url = window.location.href;
    const title = `${toolName(tool, lang)} · ${t('nav.brandName')}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return; // 用户取消，不提示
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('tool.linkCopied'));
    } catch (e) {
      toast.error(t('common.favoriteFailed'));
    }
  };

  return (
    <section className="tool-page">
      <div className="container">
        <div className="tool-page__crumb">
          <Link to="/" className="tool-page__back">
            <Icon name="arrow" size={16} className="tool-page__back-icon" />
            {t('tool.back')}
          </Link>
          {category && (
            <Link to={`/#cat-${category.code}`} className="tool-page__cat" style={{ '--accent': category.accent }}>
              <Icon name={category.icon} size={14} />
              {catName(category, lang)}
            </Link>
          )}
        </div>

        <header className="tool-page__head" style={{ '--accent': tool.accent }}>
          <span className="tool-page__icon" aria-hidden="true">
            <ToolIcon toolKey={tool.toolKey} fallback={tool.icon} size={28} />
          </span>
          <div className="tool-page__head-text">
            <h1 className="tool-page__title">{toolName(tool, lang)}</h1>
            <p className="tool-page__desc">{toolDesc(tool, lang)}</p>
            <span className={`tool-card__badge ${isLocal ? 'is-local' : 'is-cloud'}`}>
              <Icon name={isLocal ? 'device' : 'server'} size={12} />
              {isLocal ? t('tool.localBadge') : t('tool.cloudBadge')}
            </span>
          </div>
          <div className="tool-page__head-actions">
            <button
              type="button"
              className="tool-page__share"
              onClick={onShare}
              aria-label={t('tool.share')}
              title={t('tool.share')}
            >
              <Icon name="share" size={18} />
            </button>
            <button
              type="button"
              className={`tool-card__fav tool-page__fav ${tool.favorited ? 'is-on' : ''}`}
              onClick={onFav}
              aria-pressed={tool.favorited}
              aria-label={tool.favorited ? t('common.unfavorite') : t('common.favorite')}
              title={tool.favorited ? t('common.unfavorite') : t('common.favorite')}
            >
              <Icon name={tool.favorited ? 'star' : 'star-outline'} size={20} />
            </button>
          </div>
        </header>

        <div className="tool-page__body">
          <ErrorBoundary
            key={tool.toolKey}
            fallback={(reset) => (
              <div className="coming-soon">
                <Icon name="shield" size={28} />
                <h2 className="coming-soon__title">{t('tool.errorTitle')}</h2>
                <p className="coming-soon__text">{t('tool.errorText')}</p>
                <button type="button" className="btn btn--ghost" onClick={reset}>{t('tool.errorRetry')}</button>
              </div>
            )}
          >
            {isPdfTool(tool.toolKey) ? (
              <PdfToolRunner tool={tool} />
            ) : LocalTool ? (
              <Suspense fallback={<div className="tool-loading"><span className="tool-spinner" />{t('tool.loading')}</div>}>
                <LocalTool tool={tool} />
              </Suspense>
            ) : (
              <div className="coming-soon">
                <Icon name="bolt" size={30} />
                <h2 className="coming-soon__title">{t('tool.comingSoonTitle')}</h2>
                <p className="coming-soon__text">{t('tool.comingSoonText')}</p>
              </div>
            )}
          </ErrorBoundary>
        </div>

        {related.length > 0 && (
          <div className="tool-related">
            <h2 className="tool-related__title">{t('tool.relatedTitle')}</h2>
            <div className="tool-grid">
              {related.map((rt, i) => (
                <Reveal key={rt.toolKey} delay={Math.min(i, 6) * 35}>
                  <ToolCard tool={rt} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
