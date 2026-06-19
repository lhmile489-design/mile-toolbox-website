import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from './translations';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'mile-lang';

function getInitialLang() {
  if (typeof window === 'undefined') return 'zh';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
  } catch (e) {
    /* localStorage 不可用时忽略 */
  }
  const navLang = (window.navigator.language || '').toLowerCase();
  return navLang.startsWith('zh') ? 'zh' : 'en';
}

function resolve(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* ignore */
    }
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    const title = resolve(translations[lang], 'documentTitle');
    if (title) document.title = title;
  }, [lang]);

  const t = useCallback(
    (path, vars) => {
      let str = resolve(translations[lang], path);
      if (str == null) str = resolve(translations.zh, path);
      if (typeof str !== 'string') return str;
      if (vars) {
        Object.keys(vars).forEach((key) => {
          str = str.replace(new RegExp(`\\{${key}\\}`, 'g'), String(vars[key]));
        });
      }
      return str;
    },
    [lang]
  );

  const toggle = useCallback(() => setLang((l) => (l === 'zh' ? 'en' : 'zh')), []);

  const value = useMemo(() => ({ lang, setLang, toggle, t }), [lang, toggle, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within a LanguageProvider');
  return ctx;
}
