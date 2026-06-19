import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icons';
import ToolIcon from './ToolIcon';
import Reveal from './Reveal';
import { toolName, toolDesc } from '../data/tools';
import { fetchHotTools } from '../api/tools';
import { useToolData } from '../data/ToolDataContext';
import { useLang } from '../i18n/LanguageContext';

const HOT_LIMIT = 8;

function formatCount(n) {
  return n >= 10000 ? `${(n / 10000).toFixed(1)}w` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}

export default function HotTools() {
  const { t, lang } = useLang();
  const { hot, normalizeTools } = useToolData();
  const [by, setBy] = useState('count');
  const [usersHot, setUsersHot] = useState(null);
  const [loading, setLoading] = useState(false);

  // 「最多人用」维度按需拉取一次（count 维度复用 context 的 hot）
  useEffect(() => {
    if (by !== 'users' || usersHot !== null) return undefined;
    let alive = true;
    setLoading(true);
    fetchHotTools(HOT_LIMIT, 'users')
      .then((data) => {
        if (alive) setUsersHot(normalizeTools(data || []));
      })
      .catch(() => {
        if (alive) setUsersHot([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [by, usersHot, normalizeTools]);

  const list = by === 'count' ? hot : usersHot || [];

  return (
    <section className="hot" id="hot">
      <div className="container">
        <header className="section-head">
          <div>
            <span className="section-eyebrow mono">{t('hot.eyebrow')}</span>
            <h2 className="section-title">
              <Icon name="fire" size={26} className="hot__fire" />
              {t('hot.title')}
            </h2>
          </div>
          <div className="hot__switch" role="tablist" aria-label={t('hot.switchAria')}>
            <button
              type="button"
              role="tab"
              aria-selected={by === 'count'}
              className={`hot__switch-btn ${by === 'count' ? 'is-active' : ''}`}
              onClick={() => setBy('count')}
            >
              {t('hot.byCount')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={by === 'users'}
              className={`hot__switch-btn ${by === 'users' ? 'is-active' : ''}`}
              onClick={() => setBy('users')}
            >
              {t('hot.byUsers')}
            </button>
          </div>
        </header>

        {loading && list.length === 0 ? (
          <div className="tool-loading"><span className="tool-spinner" />{t('tool.loading')}</div>
        ) : (
          <ol className="hot-list">
            {list.map((tool, i) => (
              <Reveal as="li" key={`${by}-${tool.toolKey}`} delay={Math.min(i, 8) * 40}>
                <Link className="hot-item" to={tool.routePath} style={{ '--accent': tool.accent }}>
                  <span className={`hot-item__rank mono ${i < 3 ? 'is-top' : ''}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="hot-item__icon" aria-hidden="true">
                    <ToolIcon toolKey={tool.toolKey} fallback={tool.icon} size={20} />
                  </span>
                  <span className="hot-item__info">
                    <span className="hot-item__name">{toolName(tool, lang)}</span>
                    <span className="hot-item__desc">{toolDesc(tool, lang)}</span>
                  </span>
                  <span className="hot-item__count mono">
                    <Icon name="bolt" size={13} />
                    {formatCount(tool.useCount)}
                  </span>
                </Link>
              </Reveal>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
