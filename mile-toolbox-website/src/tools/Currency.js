import React, { useState } from 'react';
import { L } from './ui';
import Icon from '../components/Icons';
import { currency } from '../api/query';
import { useLang } from '../i18n/LanguageContext';

/** 常用货币（代码 + 中英名称），用于下拉选择；也允许手填任意三字母代码 */
const COMMON = [
  ['USD', '美元', 'US Dollar'],
  ['CNY', '人民币', 'Chinese Yuan'],
  ['EUR', '欧元', 'Euro'],
  ['JPY', '日元', 'Japanese Yen'],
  ['GBP', '英镑', 'British Pound'],
  ['HKD', '港币', 'Hong Kong Dollar'],
  ['KRW', '韩元', 'Korean Won'],
  ['AUD', '澳元', 'Australian Dollar'],
  ['CAD', '加元', 'Canadian Dollar'],
  ['SGD', '新加坡元', 'Singapore Dollar'],
  ['THB', '泰铢', 'Thai Baht'],
  ['RUB', '卢布', 'Russian Ruble'],
  ['TWD', '新台币', 'Taiwan Dollar'],
  ['MYR', '马来西亚林吉特', 'Malaysian Ringgit'],
  ['CHF', '瑞士法郎', 'Swiss Franc'],
  ['INR', '印度卢比', 'Indian Rupee'],
];

const CODE_RE = /^[A-Za-z]{3}$/;

export default function Currency() {
  const { lang } = useLang();
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('CNY');
  const [amount, setAmount] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const mapError = (e) => {
    const m = {
      10001: L(lang, '货币代码或金额有误', 'Invalid currency code or amount'),
      10405: L(lang, '第三方汇率服务调用失败，请稍后再试', 'Exchange-rate service failed, try again later'),
      10306: L(lang, '操作过于频繁，请稍后再试', 'Too many requests, try again later'),
      NETWORK: L(lang, '网络异常，请稍后重试', 'Network error, please try again'),
    };
    return m[e.code] || e.message || L(lang, '换算失败', 'Conversion failed');
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
    setResult(null);
  };

  const run = async (e) => {
    e.preventDefault();
    if (loading) return;
    const f = from.trim().toUpperCase();
    const tt = to.trim().toUpperCase();
    const amt = amount === '' ? 1 : Number(amount);
    if (!CODE_RE.test(f) || !CODE_RE.test(tt)) {
      setError(L(lang, '请输入 3 位字母货币代码（如 USD）', 'Enter a 3-letter currency code (e.g. USD)'));
      setResult(null);
      return;
    }
    if (!Number.isFinite(amt) || amt < 0) {
      setError(L(lang, '金额需为非负数', 'Amount must be a non-negative number'));
      setResult(null);
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await currency({ from: f, to: tt, amount: amt });
      setResult(data);
    } catch (err) {
      setError(mapError(err));
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => {
    const num = Number(n);
    if (!Number.isFinite(num)) return n;
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  return (
    <div className="tui">
      <datalist id="currency-codes">
        {COMMON.map(([code, zh, en]) => (
          <option key={code} value={code}>{`${code} · ${L(lang, zh, en)}`}</option>
        ))}
      </datalist>

      <form className="tui-row" onSubmit={run} style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <label className="tui-field" style={{ flex: '1 1 120px' }}>
          <span className="tui-label">{L(lang, '金额', 'Amount')}</span>
          <input
            className="tui-input"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1"
          />
        </label>
        <label className="tui-field" style={{ flex: '1 1 120px' }}>
          <span className="tui-label">{L(lang, '从', 'From')}</span>
          <input className="tui-input mono" list="currency-codes" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="USD" maxLength={3} />
        </label>
        <button type="button" className="tui-copy" onClick={swap} title={L(lang, '互换', 'Swap')} style={{ alignSelf: 'flex-end', height: 42 }}>
          <Icon name="convert" size={16} />
        </button>
        <label className="tui-field" style={{ flex: '1 1 120px' }}>
          <span className="tui-label">{L(lang, '到', 'To')}</span>
          <input className="tui-input mono" list="currency-codes" value={to} onChange={(e) => setTo(e.target.value)} placeholder="CNY" maxLength={3} />
        </label>
        <button type="submit" className="btn btn--cta" disabled={loading} style={{ alignSelf: 'flex-end' }}>
          {loading ? L(lang, '换算中…', 'Converting…') : L(lang, '换算', 'Convert')}
        </button>
      </form>

      {error && <div className="tui-error">{error}</div>}

      {result && (
        <>
          <div className="tui-stats">
            <div className="tui-stat">
              <span className="tui-stat__num">{fmt(result.result)}</span>
              <span className="tui-stat__label">{`${fmt(result.amount)} ${result.from} → ${result.to}`}</span>
            </div>
            <div className="tui-stat">
              <span className="tui-stat__num">{fmt(result.rate)}</span>
              <span className="tui-stat__label">{`1 ${result.from} = ${fmt(result.rate)} ${result.to}`}</span>
            </div>
          </div>
          {result.updatedAt && (
            <div className="tui-muted">
              {L(lang, '汇率更新时间', 'Rate updated')}: {result.updatedAt}
              {' · '}
              {L(lang, '汇率每日更新一次，仅供参考', 'Rates update daily, for reference only')}
            </div>
          )}
        </>
      )}
    </div>
  );
}
