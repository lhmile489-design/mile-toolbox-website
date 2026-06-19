import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icons';
import ToolIcon from './ToolIcon';
import { toolName, toolDesc } from '../data/tools';
import { useToolData } from '../data/ToolDataContext';
import { useAuth } from '../auth/AuthContext';
import { useAuthModal } from './AuthModalProvider';
import { useToast } from './Toast';
import { useLang } from '../i18n/LanguageContext';

export default function ToolCard({ tool, compact = false }) {
  const { t, lang } = useLang();
  const { isAuthenticated } = useAuth();
  const { toggleFavorite } = useToolData();
  const { open } = useAuthModal();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const name = toolName(tool, lang);
  const desc = toolDesc(tool, lang);

  const onFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    if (!isAuthenticated) {
      open('login');
      return;
    }
    setPending(true);
    try {
      await toggleFavorite(tool);
    } catch (err) {
      toast.error(t('common.favoriteFailed'));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={`tool-card ${compact ? 'tool-card--compact' : ''}`} style={{ '--accent': tool.accent }}>
      <Link className="tool-card__link" to={tool.routePath} aria-label={name}>
        <span className="tool-card__icon" aria-hidden="true">
          <ToolIcon toolKey={tool.toolKey} fallback={tool.icon} size={compact ? 18 : 22} />
        </span>
        <span className="tool-card__body">
          <span className="tool-card__name">{name}</span>
          {!compact && <span className="tool-card__desc">{desc}</span>}
          <span
            className={`tool-card__badge ${tool.handleType === 'front' ? 'is-local' : 'is-cloud'}`}
          >
            <Icon name={tool.handleType === 'front' ? 'device' : 'server'} size={12} />
            {tool.handleType === 'front' ? t('tools.badgeLocal') : t('tools.badgeCloud')}
          </span>
        </span>
      </Link>

      <button
        type="button"
        className={`tool-card__fav ${tool.favorited ? 'is-on' : ''}`}
        onClick={onFav}
        disabled={pending}
        aria-pressed={tool.favorited}
        aria-label={tool.favorited ? t('common.unfavorite') : t('common.favorite')}
        title={tool.favorited ? t('common.unfavorite') : t('common.favorite')}
      >
        <Icon name={tool.favorited ? 'star' : 'star-outline'} size={17} />
      </button>
    </div>
  );
}
