import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons';
import { changePassword } from '../api/user';
import { useAuth } from '../auth/AuthContext';
import { useAuthModal } from '../components/AuthModalProvider';
import { useToast } from '../components/Toast';
import { useLang } from '../i18n/LanguageContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^1[3-9]\d{9}$/;

export default function Profile() {
  const { t } = useLang();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { open } = useAuthModal();
  const toast = useToast();
  const [tab, setTab] = useState('info');

  if (!isAuthenticated) {
    return (
      <section className="tool-page">
        <div className="container">
          <div className="coming-soon">
            <Icon name="user" size={30} />
            <h1 className="coming-soon__title">{t('profile.title')}</h1>
            <p className="coming-soon__text">{t('profile.loginRequired')}</p>
            <button type="button" className="btn btn--cta" onClick={() => open('login')}>
              {t('profile.loginBtn')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="tool-page">
      <div className="container" style={{ maxWidth: 640 }}>
        <Link to="/" className="tool-page__back">
          <Icon name="arrow" size={16} className="tool-page__back-icon" />
          {t('tool.back')}
        </Link>

        <header className="tool-page__head" style={{ '--accent': 'var(--color-primary)' }}>
          <span className="tool-page__icon" aria-hidden="true">
            <Icon name="user" size={28} />
          </span>
          <div className="tool-page__head-text">
            <h1 className="tool-page__title">{user.nickname || user.username}</h1>
            <p className="tool-page__desc">@{user.username}</p>
          </div>
        </header>

        <div className="tool-tabs" style={{ marginTop: 24 }}>
          <button type="button" className={`tool-tab ${tab === 'info' ? 'is-active' : ''}`} onClick={() => setTab('info')}>
            {t('profile.tabInfo')}
          </button>
          <button type="button" className={`tool-tab ${tab === 'password' ? 'is-active' : ''}`} onClick={() => setTab('password')}>
            {t('profile.tabPassword')}
          </button>
        </div>

        <div className="tool-page__body">
          {tab === 'info' ? (
            <ProfileInfo user={user} updateProfile={updateProfile} toast={toast} t={t} />
          ) : (
            <ProfilePassword toast={toast} t={t} />
          )}
        </div>
      </div>
    </section>
  );
}

function ProfileInfo({ user, updateProfile, toast, t }) {
  const [form, setForm] = useState({
    nickname: user.nickname || '',
    email: user.email || '',
    phone: user.phone || '',
    avatar: user.avatar || '',
  });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrs((x) => ({ ...x, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (form.email && !EMAIL_RE.test(form.email)) e.email = t('profile.errors.emailInvalid');
    if (form.phone && !PHONE_RE.test(form.phone)) e.phone = t('profile.errors.phoneInvalid');
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (busy || !validate()) return;
    setBusy(true);
    try {
      await updateProfile({
        nickname: form.nickname.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        avatar: form.avatar.trim() || undefined,
      });
      toast.success(t('profile.saved'));
    } catch (err) {
      const byCode = err && err.code != null ? t(`profile.errors.${err.code}`) : null;
      toast.error(typeof byCode === 'string' ? byCode : err.code === 'NETWORK' ? t('profile.errors.network') : t('profile.errors.generic'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="tui" onSubmit={submit}>
      {form.avatar && (
        <img className="profile-avatar" src={form.avatar} alt="avatar" onError={(e) => { e.target.style.display = 'none'; }} />
      )}
      <label className="tui-field">
        <span className="tui-label">{t('profile.username')}</span>
        <input className="tui-input" value={user.username} readOnly disabled />
      </label>
      <label className="tui-field">
        <span className="tui-label">{t('profile.nickname')}</span>
        <input className="tui-input" value={form.nickname} onChange={set('nickname')} placeholder={t('profile.placeholderNickname')} />
      </label>
      <label className="tui-field">
        <span className="tui-label">{t('profile.email')}</span>
        <input className="tui-input" value={form.email} onChange={set('email')} placeholder={t('profile.placeholderEmail')} aria-invalid={!!errs.email} />
        {errs.email && <span className="tui-error">{errs.email}</span>}
      </label>
      <label className="tui-field">
        <span className="tui-label">{t('profile.phone')}</span>
        <input className="tui-input" value={form.phone} onChange={set('phone')} placeholder={t('profile.placeholderPhone')} aria-invalid={!!errs.phone} />
        {errs.phone && <span className="tui-error">{errs.phone}</span>}
      </label>
      <label className="tui-field">
        <span className="tui-label">{t('profile.avatar')}</span>
        <input className="tui-input" value={form.avatar} onChange={set('avatar')} placeholder={t('profile.placeholderAvatar')} />
      </label>
      <button type="submit" className="btn btn--cta" disabled={busy} style={{ alignSelf: 'flex-start' }}>
        {busy ? t('profile.saving') : t('profile.save')}
      </button>
    </form>
  );
}

function ProfilePassword({ toast, t }) {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrs((x) => ({ ...x, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.oldPassword) e.oldPassword = t('profile.errors.oldRequired');
    if (form.newPassword.length < 6 || form.newPassword.length > 32) e.newPassword = t('profile.errors.pwdLen');
    if (form.confirm !== form.newPassword) e.confirm = t('profile.errors.confirmMismatch');
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (busy || !validate()) return;
    setBusy(true);
    try {
      await changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
      toast.success(t('profile.passwordChanged'));
      setForm({ oldPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      const byCode = err && err.code != null ? t(`profile.errors.${err.code}`) : null;
      toast.error(typeof byCode === 'string' ? byCode : err.code === 'NETWORK' ? t('profile.errors.network') : t('profile.errors.generic'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="tui" onSubmit={submit}>
      <label className="tui-field">
        <span className="tui-label">{t('profile.oldPassword')}</span>
        <input className="tui-input" type="password" autoComplete="current-password" value={form.oldPassword} onChange={set('oldPassword')} aria-invalid={!!errs.oldPassword} />
        {errs.oldPassword && <span className="tui-error">{errs.oldPassword}</span>}
      </label>
      <label className="tui-field">
        <span className="tui-label">{t('profile.newPassword')}</span>
        <input className="tui-input" type="password" autoComplete="new-password" value={form.newPassword} onChange={set('newPassword')} aria-invalid={!!errs.newPassword} />
        {errs.newPassword && <span className="tui-error">{errs.newPassword}</span>}
      </label>
      <label className="tui-field">
        <span className="tui-label">{t('profile.confirmPassword')}</span>
        <input className="tui-input" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} aria-invalid={!!errs.confirm} />
        {errs.confirm && <span className="tui-error">{errs.confirm}</span>}
      </label>
      <button type="submit" className="btn btn--cta" disabled={busy} style={{ alignSelf: 'flex-start' }}>
        {busy ? t('profile.saving') : t('profile.submitPassword')}
      </button>
    </form>
  );
}
