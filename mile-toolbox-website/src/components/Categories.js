import React, { useMemo, useState } from 'react';
import Icon from './Icons';
import Reveal from './Reveal';
import ToolCard from './ToolCard';
import { catName, toolMatch } from '../data/tools';
import { useToolData } from '../data/ToolDataContext';
import { useLang } from '../i18n/LanguageContext';

export default function Categories({ query = '' }) {
  const { t, lang } = useLang();
  const { categories, tools } = useToolData();
  const [active, setActive] = useState('all');

  const kw = query.trim().toLowerCase();
  const matchKw = (tool) => toolMatch(tool, kw);

  const countOf = (code) => tools.filter((tl) => tl.categoryCode === code).length;

  const filters = useMemo(
    () => [{ code: 'all', name: t('tools.all'), icon: 'bolt', accent: 'var(--color-primary)', count: tools.length },
      ...categories.map((c) => ({ code: c.code, name: catName(c, lang), icon: c.icon, accent: c.accent, count: countOf(c.code) }))],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, categories, lang, tools]
  );

  // 分组视图（"全部"且未搜索时按分类分块；否则单组网格）
  const grouped = useMemo(() => {
    const list = active === 'all' ? categories : categories.filter((c) => c.code === active);
    return list
      .map((c) => ({ cat: c, items: tools.filter((tl) => tl.categoryCode === c.code && matchKw(tl)) }))
      .filter((g) => g.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, query, lang, tools, categories]);

  const totalVisible = grouped.reduce((n, g) => n + g.items.length, 0);
  let cardIndex = 0;

  return (
    <section className="categories" id="categories">
      <div className="container">
        <header className="section-head">
          <div>
            <span className="section-eyebrow mono">{t('tools.eyebrow')}</span>
            <h2 className="section-title">{t('tools.title')}</h2>
          </div>
          <p className="section-desc">{t('tools.desc')}</p>
        </header>
      </div>

      <div className="filter-sticky">
        <div className="container">
          <div className="filter-bar" role="tablist" aria-label={t('tools.filterAria')}>
            {filters.map((f) => (
              <button
                key={f.code}
                type="button"
                role="tab"
                aria-selected={active === f.code}
                className={`chip ${active === f.code ? 'is-active' : ''}`}
                style={{ '--accent': f.accent }}
                onClick={() => setActive(f.code)}
              >
                <Icon name={f.icon} size={16} />
                {f.name}
                <span className="chip__count">{f.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        {kw && (
          <p className="filter-result mono">{t('tools.result', { kw: query.trim(), n: totalVisible })}</p>
        )}

        {grouped.length > 0 ? (
          grouped.map((g) => (
            <div className="cat-group" key={g.cat.code} id={`cat-${g.cat.code}`}>
              <h3 className="cat-group__head" style={{ '--accent': g.cat.accent }}>
                <span className="cat-group__icon"><Icon name={g.cat.icon} size={18} /></span>
                {catName(g.cat, lang)}
                <span className="cat-group__count mono">{g.items.length}</span>
              </h3>
              <div className="tool-grid">
                {g.items.map((tool) => {
                  cardIndex += 1;
                  return (
                    <Reveal key={tool.toolKey} delay={Math.min(cardIndex, 8) * 35}>
                      <ToolCard tool={tool} />
                    </Reveal>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Icon name="search" size={32} />
            <p>{t('tools.emptyText')}</p>
          </div>
        )}
      </div>
    </section>
  );
}
