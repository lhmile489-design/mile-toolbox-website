import React from 'react';
import Icon from './Icons';
import { catName } from '../data/tools';
import { useToolData } from '../data/ToolDataContext';
import { useLang } from '../i18n/LanguageContext';

export default function Footer() {
  const { t, lang } = useLang();
  const { categories } = useToolData();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <img className="nav__logo" src={`${process.env.PUBLIC_URL}/appIcon.png`} alt={t('nav.brandName')} width="36" height="36" />
            <span className="nav__name">{t('nav.brandName')}</span>
          </div>
          <p className="footer__tagline">{t('footer.tagline')}</p>
          <a
            className="footer__social"
            href="https://gitcode.com/m0_74289362/mile-toolBox-website"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('footer.githubAria')}
          >
            <Icon name="github" size={18} />
          </a>
        </div>

        <nav className="footer__col" aria-label={t('footer.categories')}>
          <h4 className="footer__heading mono">{t('footer.categories')}</h4>
          <ul>
            {categories.map((c) => (
              <li key={c.code}>
                <a href="#categories">{catName(c, lang)}</a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer__col" aria-label={t('footer.about')}>
          <h4 className="footer__heading mono">{t('footer.about')}</h4>
          <ul>
            <li><a href="#about">{t('footer.links.intro')}</a></li>
            <li><a href="#hot">{t('footer.links.hot')}</a></li>
            <li><a href="#top">{t('footer.links.terms')}</a></li>
            <li><a href="#top">{t('footer.links.privacy')}</a></li>
          </ul>
        </nav>
      </div>

      <div className="container footer__bottom">
        <span className="mono">{t('footer.copyright', { year })}</span>
        <span className="footer__made">{t('footer.made')}</span>
      </div>
    </footer>
  );
}
