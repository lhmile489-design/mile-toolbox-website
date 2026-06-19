import React, { useEffect, useState } from 'react';
import Icon from './Icons';
import { useLang } from '../i18n/LanguageContext';

const DISMISS_KEY = 'mile-install-dismissed';

/**
 * PWA「添加到主屏」引导条：捕获 beforeinstallprompt，提供安装按钮。
 * 用户关闭后写入 localStorage，不再打扰。仅在浏览器触发该事件时显示。
 */
export default function InstallPrompt() {
  const { t } = useLang();
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(DISMISS_KEY) === '1') return undefined;
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch (e) {
      /* ignore */
    }
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    try {
      await deferred.userChoice;
    } catch (e) {
      /* ignore */
    }
    setDeferred(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="install-bar" role="dialog" aria-label={t('install.title')}>
      <span className="install-bar__icon" aria-hidden="true">
        <Icon name="download" size={18} />
      </span>
      <div className="install-bar__text">
        <strong>{t('install.title')}</strong>
        <span>{t('install.desc')}</span>
      </div>
      <button type="button" className="btn btn--primary install-bar__cta" onClick={install}>
        {t('install.action')}
      </button>
      <button type="button" className="install-bar__close" onClick={dismiss} aria-label={t('install.dismiss')}>
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}
