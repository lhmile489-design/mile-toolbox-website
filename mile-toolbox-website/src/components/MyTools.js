import React, { useEffect, useMemo, useState } from 'react';
import Icon from './Icons';
import ToolCard from './ToolCard';
import { fetchRecentUsage } from '../api/usage';
import { useToolData } from '../data/ToolDataContext';
import { useAuth } from '../auth/AuthContext';
import { useLang } from '../i18n/LanguageContext';
import { getRecent } from '../utils/recent';

export default function MyTools() {
  const { t } = useLang();
  const { user } = useAuth();
  const { tools, favorites, normalizeTools } = useToolData();
  const [apiRecent, setApiRecent] = useState([]);

  // 登录用户：后端最近使用
  useEffect(() => {
    let alive = true;
    if (!user) {
      setApiRecent([]);
      return undefined;
    }
    fetchRecentUsage(12)
      .then((data) => {
        if (alive) setApiRecent(normalizeTools(data));
      })
      .catch(() => {
        if (alive) setApiRecent([]);
      });
    return () => {
      alive = false;
    };
  }, [user, normalizeTools]);

  // 游客：本地最近使用
  const localRecent = useMemo(() => {
    if (user) return [];
    return getRecent()
      .map((key) => tools.find((tl) => tl.toolKey === key))
      .filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tools]);

  const recent = user ? apiRecent : localRecent;

  // 游客且无本地记录 → 不显示该区
  if (!user && recent.length === 0) return null;

  const renderBlock = (title, items, emptyText) => (
    <div className="my-block">
      <h3 className="my-block__title">{title}</h3>
      {items.length > 0 ? (
        <div className="my-block__grid">
          {items.map((tool) => (
            <ToolCard key={tool.toolKey} tool={tool} compact />
          ))}
        </div>
      ) : (
        <p className="my-block__empty">{emptyText}</p>
      )}
    </div>
  );

  return (
    <section className="my-tools" id="my-tools">
      <div className="container">
        <header className="section-head">
          <div>
            <span className="section-eyebrow mono">{t('my.eyebrow')}</span>
            <h2 className="section-title">
              <Icon name="user" size={24} />
              {t('my.title')}
            </h2>
          </div>
        </header>

        <div className={`my-grid ${user ? '' : 'my-grid--single'}`}>
          {renderBlock(t('my.recentTitle'), recent, t('my.recentEmpty'))}
          {user && renderBlock(t('my.favTitle'), favorites, t('my.favEmpty'))}
        </div>
      </div>
    </section>
  );
}
