import React, { useCallback, useEffect, useState } from 'react';
import { L, CopyButton, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digit: '0123456789',
  symbol: '!@#$%^&*()-_=+[]{};:,.<>?',
};
const AMBIGUOUS = /[Il1O0o]/g;
const WORDS = [
  'apple', 'river', 'tiger', 'cloud', 'stone', 'maple', 'amber', 'comet', 'delta', 'ember',
  'frost', 'glade', 'harbor', 'ivory', 'jolly', 'koala', 'lemon', 'mango', 'noble', 'olive',
  'pearl', 'quartz', 'raven', 'solar', 'tulip', 'umbra', 'vivid', 'willow', 'xenon', 'yacht', 'zebra',
];

function randInt(max) {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] % max;
  }
  return Math.floor(Math.random() * max);
}

export default function PasswordGen({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [tab, setTab] = useState('random'); // random | passphrase
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ lower: true, upper: true, digit: true, symbol: false });
  const [noAmbiguous, setNoAmbiguous] = useState(false);
  const [words, setWords] = useState(4);
  const [sep, setSep] = useState('-');
  const [pwd, setPwd] = useState('');

  const generate = useCallback(() => {
    if (tab === 'passphrase') {
      const n = Math.min(Math.max(words, 2), 10);
      const picked = Array.from({ length: n }, () => {
        const w = WORDS[randInt(WORDS.length)];
        return w.charAt(0).toUpperCase() + w.slice(1);
      });
      picked.push(String(randInt(100)).padStart(2, '0'));
      setPwd(picked.join(sep || '-'));
      report();
      return;
    }
    let pool = Object.keys(opts).filter((k) => opts[k]).map((k) => SETS[k]).join('');
    if (noAmbiguous) pool = pool.replace(AMBIGUOUS, '');
    if (!pool) {
      setPwd('');
      return;
    }
    let out = '';
    for (let i = 0; i < length; i += 1) out += pool[randInt(pool.length)];
    setPwd(out);
    report();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, length, opts, noAmbiguous, words, sep]);

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const strength = (() => {
    if (tab === 'passphrase') return words >= 5 ? 'strong' : words >= 4 ? 'good' : 'fair';
    let score = 0;
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;
    const kinds = Object.values(opts).filter(Boolean).length;
    score += kinds >= 3 ? 1 : 0;
    score += kinds === 4 ? 1 : 0;
    return ['weak', 'fair', 'good', 'strong', 'strong'][score] || 'weak';
  })();
  const strengthLabel = { weak: L(lang, '弱', 'Weak'), fair: L(lang, '中', 'Fair'), good: L(lang, '良', 'Good'), strong: L(lang, '强', 'Strong') }[strength];

  const toggle = (k) => setOpts((o) => ({ ...o, [k]: !o[k] }));

  return (
    <div className="tui">
      <div className="tool-tabs">
        <button type="button" className={`tool-tab ${tab === 'random' ? 'is-active' : ''}`} onClick={() => setTab('random')}>
          {L(lang, '随机密码', 'Random')}
        </button>
        <button type="button" className={`tool-tab ${tab === 'passphrase' ? 'is-active' : ''}`} onClick={() => setTab('passphrase')}>
          {L(lang, '口令短语', 'Passphrase')}
        </button>
      </div>

      <div className="tui-pwd">
        <input className="tui-input mono tui-pwd__val" value={pwd} readOnly placeholder={L(lang, '请选择至少一种字符集', 'Pick at least one set')} />
        <CopyButton text={pwd} />
        <button type="button" className="btn btn--cta" onClick={generate}>
          {L(lang, '重新生成', 'Regenerate')}
        </button>
      </div>

      <div className={`tui-strength is-${strength}`}>
        {L(lang, '强度', 'Strength')}: <b>{strengthLabel}</b>
      </div>

      {tab === 'random' ? (
        <>
          <label className="tui-field">
            <span className="tui-label">{L(lang, '长度', 'Length')}: <b className="mono">{length}</b></span>
            <input type="range" min={4} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="tui-range" />
          </label>
          <div className="tui-row">
            {[
              { k: 'lower', t: L(lang, '小写 a-z', 'Lowercase a-z') },
              { k: 'upper', t: L(lang, '大写 A-Z', 'Uppercase A-Z') },
              { k: 'digit', t: L(lang, '数字 0-9', 'Digits 0-9') },
              { k: 'symbol', t: L(lang, '符号 !@#', 'Symbols !@#') },
            ].map((o) => (
              <label className="tui-check" key={o.k}>
                <input type="checkbox" checked={opts[o.k]} onChange={() => toggle(o.k)} />
                {o.t}
              </label>
            ))}
            <label className="tui-check">
              <input type="checkbox" checked={noAmbiguous} onChange={(e) => setNoAmbiguous(e.target.checked)} />
              {L(lang, '排除易混字符 (Il1O0o)', 'Exclude ambiguous (Il1O0o)')}
            </label>
          </div>
        </>
      ) : (
        <div className="tui-row">
          <label className="tui-field tui-field--sm">
            <span className="tui-label">{L(lang, '单词数', 'Words')}: <b className="mono">{words}</b></span>
            <input type="range" min={2} max={8} value={words} onChange={(e) => setWords(Number(e.target.value))} className="tui-range" />
          </label>
          <label className="tui-field tui-field--sm">
            <span className="tui-label">{L(lang, '分隔符', 'Separator')}</span>
            <input className="tui-input mono" value={sep} maxLength={3} onChange={(e) => setSep(e.target.value)} placeholder="-" />
          </label>
        </div>
      )}
    </div>
  );
}
