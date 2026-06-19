import React, { useState } from 'react';
import { L } from './ui';
import { zipcode } from '../api/query';
import { useLang } from '../i18n/LanguageContext';

export default function Zipcode() {
  const { lang } = useLang();
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [list, setList] = useState(null);

  const mapError = (e) => {
    const m = {
      10001: L(lang, '请输入查询关键词', 'Please enter a keyword'),
      10402: L(lang, '未查询到结果', 'No result found'),
      10306: L(lang, '操作过于频繁，请稍后再试', 'Too many requests, try again later'),
      NETWORK: L(lang, '网络异常，请稍后重试', 'Network error, please try again'),
    };
    return m[e.code] || e.message || L(lang, '查询失败', 'Query failed');
  };

  const run = async (e) => {
    e.preventDefault();
    if (loading) return;
    const kw = keyword.trim();
    if (!kw) {
      setError(L(lang, '请输入查询关键词', 'Please enter a keyword'));
      setList(null);
      return;
    }
    setLoading(true);
    setError('');
    setList(null);
    try {
      const data = await zipcode(kw);
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(mapError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tui">
      <form className="tui-row" onSubmit={run}>
        <label className="tui-field" style={{ flex: 1, minWidth: 200 }}>
          <span className="tui-label">{L(lang, '关键词（区县/市/省 或 邮编）', 'Keyword (district/city/province or zip)')}</span>
          <input className="tui-input" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={L(lang, '如：朝阳区 / 北京 / 100020', 'e.g. Chaoyang / Beijing / 100020')} />
        </label>
        <button type="submit" className="btn btn--cta" disabled={loading} style={{ alignSelf: 'flex-end' }}>
          {loading ? L(lang, '查询中…', 'Searching…') : L(lang, '查询', 'Search')}
        </button>
      </form>

      {error && <div className="tui-error">{error}</div>}

      {list && (
        list.length > 0 ? (
          <div className="zip-list">
            {list.map((r, i) => (
              <div className="zip-item" key={`${r.zipcode}-${i}`}>
                <span className="zip-item__code mono">{r.zipcode}</span>
                <span className="zip-item__addr">
                  {[r.province, r.city, r.district].filter(Boolean).join(' / ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="tui-muted">{L(lang, '未查询到结果', 'No result found')}</div>
        )
      )}
    </div>
  );
}
