import React, { useState } from 'react';
import { L } from './ui';
import { ipLocation } from '../api/query';
import { useLang } from '../i18n/LanguageContext';

export default function IpLocation() {
  const { lang } = useLang();
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const mapError = (e) => {
    const m = {
      10401: L(lang, 'IP 格式不正确', 'Invalid IP format'),
      10402: L(lang, '未查询到归属地', 'Location not found'),
      10306: L(lang, '操作过于频繁，请稍后再试', 'Too many requests, try again later'),
      NETWORK: L(lang, '网络异常，请稍后重试', 'Network error, please try again'),
    };
    return m[e.code] || e.message || L(lang, '查询失败', 'Query failed');
  };

  const run = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await ipLocation(ip.trim() || undefined);
      setResult(data);
    } catch (err) {
      setError(mapError(err));
    } finally {
      setLoading(false);
    }
  };

  const rows = result
    ? [
        { l: 'IP', v: result.ip },
        { l: L(lang, '国家', 'Country'), v: result.country },
        { l: L(lang, '省份', 'Province'), v: result.province },
        { l: L(lang, '城市', 'City'), v: result.city },
        { l: L(lang, '运营商', 'ISP'), v: result.isp },
      ].filter((r) => r.v)
    : [];

  return (
    <div className="tui">
      <form className="tui-row" onSubmit={run}>
        <label className="tui-field" style={{ flex: 1, minWidth: 200 }}>
          <span className="tui-label">{L(lang, 'IP 地址（留空查本机）', 'IP address (blank for your own)')}</span>
          <input className="tui-input mono" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="114.114.114.114" />
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
