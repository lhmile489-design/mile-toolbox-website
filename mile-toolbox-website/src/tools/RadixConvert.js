import React, { useState } from 'react';
import { L, CopyButton, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

const BASES = [
  { key: 'bin', radix: 2, label: '2 / BIN' },
  { key: 'oct', radix: 8, label: '8 / OCT' },
  { key: 'dec', radix: 10, label: '10 / DEC' },
  { key: 'hex', radix: 16, label: '16 / HEX' },
];

export default function RadixConvert({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [values, setValues] = useState({ bin: '', oct: '', dec: '', hex: '' });
  const [error, setError] = useState('');

  const onChange = (fromKey, raw) => {
    const v = raw.trim();
    const from = BASES.find((b) => b.key === fromKey);
    if (!v) {
      setValues({ bin: '', oct: '', dec: '', hex: '' });
      setError('');
      return;
    }
    const valid = {
      bin: /^[01]+$/,
      oct: /^[0-7]+$/,
      dec: /^\d+$/,
      hex: /^[0-9a-fA-F]+$/,
    }[fromKey];
    if (!valid.test(v)) {
      setValues((s) => ({ ...s, [fromKey]: raw }));
      setError(L(lang, `不是合法的 ${from.radix} 进制数`, `Not a valid base-${from.radix} number`));
      return;
    }
    const n = parseInt(v, from.radix);
    if (Number.isNaN(n) || !Number.isSafeInteger(n)) {
      setValues((s) => ({ ...s, [fromKey]: raw }));
      setError(L(lang, '数值过大（超出安全整数范围）', 'Number too large (exceeds safe integer)'));
      return;
    }
    setError('');
    setValues({
      bin: n.toString(2),
      oct: n.toString(8),
      dec: n.toString(10),
      hex: n.toString(16).toUpperCase(),
    });
    report();
  };

  return (
    <div className="tui">
      {BASES.map((b) => (
        <div className="tui-field" key={b.key}>
          <span className="tui-label">
            {L(lang, '进制', 'Base')} {b.label}
          </span>
          <div className="tui-input-row">
            <input
              className="tui-input mono"
              value={values[b.key]}
              onChange={(e) => onChange(b.key, e.target.value)}
              placeholder={L(lang, '输入', 'Enter')}
            />
            <CopyButton text={values[b.key]} small />
          </div>
        </div>
      ))}
      {error && <div className="tui-error">{error}</div>}
    </div>
  );
}
