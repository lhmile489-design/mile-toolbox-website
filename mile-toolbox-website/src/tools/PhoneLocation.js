import React, { useState } from 'react';
import { L } from './ui';
import { phoneLocation } from '../api/query';
import { useLang } from '../i18n/LanguageContext';

export default function PhoneLocation() {
  const { lang } = useLang();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const mapError = (e) => {
    const m = {
      10400: L(lang, '手机号格式不正确', 'Invalid phone number'),
      10402: L(lang, '未查询到归属地', 'Location not found'),
      10306: L(lang, '操作过于频繁，请稍后再试', 'Too many requests, try again later'),
      NETWORK: L(lang, '网络异常，请稍后重试', 'Network error, please try again'),
    };
    return m[e.code] || e.message || L(lang, '查询失败', 'Query failed');
  };

  const run = async (e) => {
    e.preventDefault();
    if (loading) return;
    const p = phone.trim();
    if (!/^1[3-9]\d{9}$/.test(p)) {
      setError(L(lang, '请输入 11 位有效手机号', 'Please enter a valid 11-digit phone number'));
      setResult(null);
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await phoneLocation(p);
      setResult(data);
    } catch (err) {
      setError(mapError(err));
    } finally {
      setLoading(false);
    }
  };

  const rows = result
    ? [
        { l: L(lang, '省份', 'Province'), v: result.province },
        { l: L(lang, '城市', 'City'), v: result.city },
        { l: L(lang, '运营商', 'Carrier'), v: result.carrier },
        { l: L(lang, '区号', 'Area code'), v: result.areaCode },
        { l: L(lang, '邮编', 'Zip code'), v: result.zipCode },
        { l: L(lang, '号段', 'Segment'), v: result.segment },
      ].filter((r) => r.v)
    : [];

  return (
    <div className="tui">
      <form className="tui-row" onSubmit={run}>
        <label className="tui-field" style={{ flex: 1, minWidth: 200 }}>
          <span className="tui-label">{L(lang, '手机号', 'Phone number')}</span>
          <input
            className="tui-input mono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={11}
            inputMode="numeric"
            placeholder="13800138000"
          />
        </label>
        <button type="submit" className="btn btn--cta" disabled={loading} style={{ alignSelf: 'flex-end' }}>
          {loading ? L(lang, '查询中…', 'Searching…') : L(lang, '查询', 'Search')}
        </button>
      </form>

      {error && <div className="tui-error">{error}</div>}

      {result && (
        <div className="tui-stats">
          {rows.map((r) => (
            <div className="tui-stat" key={r.l}>
              <span className="tui-stat__num" style={{ fontSize: '1.05rem' }}>{r.v}</span>
              <span className="tui-stat__label">{r.l}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
