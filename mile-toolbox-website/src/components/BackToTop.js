import React, { useEffect, useState } from 'react';
import Icon from './Icons';
import { useLang } from '../i18n/LanguageContext';

export default function BackToTop() {
  const { t } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={t('common.backToTop')}
      title={t('common.backToTop')}
    >
      <Icon name="arrow" size={20} />
    </button>
  );
}
