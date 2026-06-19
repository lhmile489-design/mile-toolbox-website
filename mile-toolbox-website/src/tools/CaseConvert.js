import React, { useMemo, useState } from 'react';
import { L, CopyButton, ToolBlock, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

function words(s) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}
const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

export default function CaseConvert({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [input, setInput] = useState('');

  const rows = useMemo(() => {
    const ws = words(input);
    if (ws.length === 0) return [];
    const lower = ws.map((w) => w.toLowerCase());
    return [
      { label: 'camelCase', value: lower.map((w, i) => (i === 0 ? w : cap(w))).join('') },
      { label: 'PascalCase', value: ws.map(cap).join('') },
      { label: 'snake_case', value: lower.join('_') },
      { label: 'kebab-case', value: lower.join('-') },
      { label: 'CONSTANT_CASE', value: lower.join('_').toUpperCase() },
      { label: 'dot.case', value: lower.join('.') },
      { label: 'Title Case', value: ws.map(cap).join(' ') },
      { label: 'sentence case', value: (() => { const j = lower.join(' '); return j.charAt(0).toUpperCase() + j.slice(1); })() },
    ];
  }, [input]);

  const onInput = (v) => {
    setInput(v);
    if (v) report();
  };

  return (
    <div className="tui">
      <ToolBlock label={L(lang, '输入', 'Input')}>
        <input className="tui-input" value={input} onChange={(e) => onInput(e.target.value)} placeholder="hello world / helloWorld / hello_world" />
      </ToolBlock>
      {rows.map((r) => (
        <div className="tui-field" key={r.label}>
          <span className="tui-label">{r.label}</span>
          <div className="tui-input-row">
            <input className="tui-input mono" value={r.value} readOnly />
            <CopyButton text={r.value} small />
          </div>
        </div>
      ))}
    </div>
  );
}
