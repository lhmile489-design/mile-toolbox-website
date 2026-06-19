import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons';
import { useLang } from '../i18n/LanguageContext';

export default function NotFound() {
  const { t } = useLang();
  return (
    <section className="tool-page">
      <div className="container">
        <div className="notfound">
          <span className="notfound__code mono">404</span>
          <h1 className="notfound__title">{t('notfound.title')}</h1>
          <p className="notfound__text">{t('notfound.text')}</p>
          <Link to="/" className="btn btn--cta">
            <Icon name="arrow" size={18} className="tool-page__back-icon" />
            {t('notfound.home')}
          </Link>
        </div>
      </div>
    </section>
  );
}
