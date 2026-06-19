import React from 'react';
import Icon from './Icons';
import Reveal from './Reveal';
import { useLang } from '../i18n/LanguageContext';
import { useAuthModal } from './AuthModalProvider';

const FEATURE_ITEMS = [
  { key: 'privacy', icon: 'shield' },
  { key: 'instant', icon: 'bolt' },
  { key: 'cloud', icon: 'server' },
  { key: 'fav', icon: 'star' },
];

export default function Features() {
  const { t } = useLang();
  const { open } = useAuthModal();

  return (
    <section className="features" id="about">
      <div className="container">
        <header className="section-head">
          <div>
            <span className="section-eyebrow mono">{t('features.eyebrow')}</span>
            <h2 className="section-title">{t('features.title')}</h2>
          </div>
          <p className="section-desc">{t('features.desc')}</p>
        </header>

        <div className="feature-grid">
          {FEATURE_ITEMS.map((f, i) => (
            <Reveal as="article" className="feature-card" key={f.key} delay={i * 70}>
              <span className="feature-card__icon" aria-hidden="true">
                <Icon name={f.icon} size={24} />
              </span>
              <h3 className="feature-card__title">{t(`features.items.${f.key}.title`)}</h3>
              <p className="feature-card__desc">{t(`features.items.${f.key}.desc`)}</p>
            </Reveal>
          ))}
        </div>

        <div className="cta-band">
          <div className="cta-band__text">
            <h3 className="cta-band__title">{t('features.ctaTitle')}</h3>
            <p>{t('features.ctaText')}</p>
          </div>
          <div className="cta-band__actions">
            <a href="#categories" className="btn btn--on-accent">
              {t('features.ctaBrowse')}
              <Icon name="arrow" size={18} />
            </a>
            <button type="button" className="btn btn--outline-light" onClick={() => open('register')}>
              {t('features.ctaRegister')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
