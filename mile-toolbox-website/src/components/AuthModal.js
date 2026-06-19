import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icons';
import { useAuth } from '../auth/AuthContext';
import { useToast } from './Toast';
import { useLang } from '../i18n/LanguageContext';

const EMPTY = { username: '', password: '', nickname: '', confirm: '' };

export default function AuthModal({ mode, onClose, onSwitch, onSuccess }) {
  const { t } = useLang();
  const { login, register } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [fieldErr, setFieldErr] = useState({});
  const [formErr, setFormErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const firstInputRef = useRef(null);
  const isLogin = mode === 'login';

  // 切换登录/注册时清空状态
  useEffect(() => {
    setForm(EMPTY);
    setFieldErr({});
    setFormErr('');
  }, [mode]);

  // 打开时锁滚动、聚焦首个输入、Esc 关闭
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstInputRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFieldErr((fe) => ({ ...fe, [key]: undefined }));
    setFormErr('');
  };

  const validate = () => {
    const errs = {};
    const u = form.username.trim();
    if (!u) errs.username = t('auth.errors.usernameRequired');
    else if (u.length < 3 || u.length > 32) errs.username = t('auth.errors.usernameLen');

    if (!form.password) errs.password = t('auth.errors.passwordRequired');
    else if (form.password.length < 6 || form.password.length > 32)
      errs.password = t('auth.errors.passwordLen');

    if (!isLogin && form.confirm !== form.password) {
      errs.confirm = t('auth.errors.confirmMismatch');
    }
    setFieldErr(errs);
    return Object.keys(errs).length === 0;
  };

  const mapError = (e) => {
    if (e && e.code === 'NETWORK') return t('auth.errors.network');
    const byCode = e && e.code != null ? t(`auth.errors.${e.code}`) : null;
    return typeof byCode === 'string' ? byCode : (e && e.message) || t('auth.errors.generic');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting || !validate()) return;
    setSubmitting(true);
    setFormErr('');
    const username = form.username.trim();
    const nickname = form.nickname.trim();
    try {
      let user;
      if (isLogin) {
        user = await login({ username, password: form.password });
      } else {
        await register({ username, password: form.password, nickname: nickname || undefined });
        // 注册成功后自动登录，体验更顺
        user = await login({ username, password: form.password });
      }
      toast.success(t('auth.welcome', { name: user.nickname || user.username }));
      onSuccess?.(user);
      onClose();
    } catch (err) {
      setFormErr(mapError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button type="button" className="auth-modal__close" onClick={onClose} aria-label={t('auth.close')}>
          <Icon name="close" size={20} />
        </button>

        <div className="auth-modal__head">
          <img src={`${process.env.PUBLIC_URL}/appIcon.png`} alt="Mile" width="48" height="48" />
          <h2 id="auth-title" className="auth-modal__title">
            {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
          </h2>
          <p className="auth-modal__subtitle">
            {isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
          </p>
        </div>

        <form className="auth-form" onSubmit={submit} noValidate>
          <label className="auth-field">
            <span className="auth-field__label">{t('auth.username')}</span>
            <input
              ref={firstInputRef}
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={setField('username')}
              placeholder={t('auth.usernamePlaceholder')}
              aria-invalid={!!fieldErr.username}
            />
            {fieldErr.username && <span className="auth-field__err">{fieldErr.username}</span>}
          </label>

          {!isLogin && (
            <label className="auth-field">
              <span className="auth-field__label">{t('auth.nickname')}</span>
              <input
                type="text"
                value={form.nickname}
                onChange={setField('nickname')}
                placeholder={t('auth.nicknamePlaceholder')}
              />
            </label>
          )}

          <label className="auth-field">
            <span className="auth-field__label">{t('auth.password')}</span>
            <input
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={form.password}
              onChange={setField('password')}
              placeholder={t('auth.passwordPlaceholder')}
              aria-invalid={!!fieldErr.password}
            />
            {fieldErr.password && <span className="auth-field__err">{fieldErr.password}</span>}
          </label>

          {!isLogin && (
            <label className="auth-field">
              <span className="auth-field__label">{t('auth.confirmPassword')}</span>
              <input
                type="password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={setField('confirm')}
                placeholder={t('auth.confirmPlaceholder')}
                aria-invalid={!!fieldErr.confirm}
              />
              {fieldErr.confirm && <span className="auth-field__err">{fieldErr.confirm}</span>}
            </label>
          )}

          {formErr && (
            <div className="auth-form__error" role="alert">
              <Icon name="shield" size={15} />
              {formErr}
            </div>
          )}

          <button type="submit" className="btn btn--cta auth-form__submit" disabled={submitting}>
            {submitting ? t('auth.submitting') : isLogin ? t('auth.submitLogin') : t('auth.submitRegister')}
          </button>
        </form>

        <button type="button" className="auth-modal__switch" onClick={onSwitch}>
          {isLogin ? t('auth.toRegister') : t('auth.toLogin')}
        </button>
      </div>
    </div>
  );
}
