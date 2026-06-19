import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icons';
import { useLang } from '../i18n/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import { useAuthModal } from './AuthModalProvider';
import { useTheme } from '../theme/ThemeContext';
import { useCommandPalette } from './CommandPalette';

const NAV_LINKS = [
  { key: 'allTools', href: '/#categories' },
  { key: 'hot', href: '/#hot' },
  { key: 'about', href: '/#about' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { t, toggle } = useLang();
  const { user, isAuthenticated, logout } = useAuth();
  const { open: openAuth } = useAuthModal();
  const { theme, toggle: toggleTheme } = useTheme();
  const { openPalette } = useCommandPalette();

  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link className="nav__brand" to="/" aria-label={t('nav.brandAlt')}>
          <img className="nav__logo" src={`${process.env.PUBLIC_URL}/appIcon.png`} alt={t('nav.brandName')} width="36" height="36" />
          <span className="nav__name">{t('nav.brandName')}</span>
        </Link>

        <nav className={`nav__menu ${open ? 'is-open' : ''}`} aria-label={t('nav.navAria')}>
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)}>
                  {t(`nav.${l.key}`)}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav__actions">
            <button
              type="button"
              className="nav__search-trigger"
              onClick={() => {
                openPalette();
                setOpen(false);
              }}
              aria-label={t('palette.title')}
              title={t('palette.title')}
            >
              <Icon name="search" size={16} />
              <span className="nav__search-text">{t('palette.trigger')}</span>
              <kbd className="nav__search-kbd mono">⌘K</kbd>
            </button>
            <button
              type="button"
              className="nav__icon-btn"
              onClick={toggleTheme}
              aria-label={t('common.themeSwitchAria')}
              title={t('common.themeSwitchAria')}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
            </button>
            <button
              type="button"
              className="nav__lang"
              onClick={toggle}
              aria-label={t('common.langSwitchAria')}
              title={t('common.langSwitchAria')}
            >
              <Icon name="globe" size={16} />
              {t('common.langOther')}
            </button>
            {isAuthenticated ? (
              <>
                <Link className="nav__user" to="/profile" onClick={() => setOpen(false)}>
                  <Icon name="user" size={16} />
                  {user.nickname || user.username}
                </Link>
                <button type="button" className="btn btn--ghost" onClick={logout}>
                  <Icon name="logout" size={16} />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    openAuth('login');
                    setOpen(false);
                  }}
                >
                  <Icon name="user" size={18} />
                  {t('nav.login')}
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    openAuth('register');
                    setOpen(false);
                  }}
                >
                  {t('nav.register')}
                </button>
              </>
            )}
          </div>
        </nav>

        <button
          type="button"
          className="nav__toggle"
          aria-label={open ? t('nav.menuClose') : t('nav.menuOpen')}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'close' : 'menu'} size={22} />
        </button>
      </div>
    </header>
  );
}
