import React, { useMemo, useState } from 'react';
import { L, CopyButton, ToolBlock, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

const FLAGS = ['g', 'i', 'm', 's', 'u'];

export default function RegexTest({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false, u: false });
  const [text, setText] = useState('');
  const [replaceMode, setReplaceMode] = useState(false);
  const [replacement, setReplacement] = useState('');

  const { error, matches, highlighted, replaced } = useMemo(() => {
    if (!pattern) return { error: '', matches: [], highlighted: null, replaced: '' };
    const flagStr = FLAGS.filter((f) => flags[f]).join('');
    let re;
    try {
      re = new RegExp(pattern, flagStr.includes('g') ? flagStr : `${flagStr}g`);
    } catch (e) {
      return { error: e.message, matches: [], highlighted: null, replaced: '' };
    }
    const found = [];
    const parts = [];
    let last = 0;
    let m;
    let guard = 0;
    while ((m = re.exec(text)) !== null && guard < 10000) {
      guard += 1;
      found.push({ index: m.index, value: m[0], groups: m.slice(1) });
      parts.push(text.slice(last, m.index));
      parts.push(<mark key={`${m.index}-${guard}`}>{m[0] || ''}</mark>);
      last = m.index + (m[0].length || 0);
      if (m[0] === '') re.lastIndex += 1;
    }
    parts.push(text.slice(last));
    let rep = '';
    if (replaceMode) {
      try {
        rep = text.replace(re, replacement);
      } catch (e) {
        rep = '';
      }
    }
    return { error: '', matches: found, highlighted: parts, replaced: rep };
  }, [pattern, flags, text, replaceMode, replacement]);

  const onText = (v) => {
    setText(v);
    if (pattern && v) report();
  };

  const maxGroups = matches.reduce((mx, m) => Math.max(mx, m.groups.length), 0);

  return (
    <div className="tui">
      <label className="tui-field">
        <span className="tui-label">{L(lang, '正则表达式', 'Regular expression')}</span>
        <input className="tui-input mono" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="(\\d{4})-(\\d{2})" aria-invalid={!!error} />
      </label>

      <div className="tui-row">
        {FLAGS.map((f) => (
          <label className="tui-check" key={f}>
            <input type="checkbox" checked={flags[f]} onChange={() => setFlags((s) => ({ ...s, [f]: !s[f] }))} />
            <span className="mono">{f}</span>
          </label>
        ))}
        <label className="tui-check">
          <input type="checkbox" checked={replaceMode} onChange={(e) => setReplaceMode(e.target.checked)} />
          {L(lang, '替换模式', 'Replace mode')}
        </label>
      </div>

      {replaceMode && (
        <label className="tui-field">
          <span className="tui-label">{L(lang, '替换为（支持 $1 $2 分组）', 'Replacement ($1 $2 groups)')}</span>
          <input className="tui-input mono" value={replacement} onChange={(e) => setReplacement(e.target.value)} placeholder="$1/$2" />
        </label>
      )}

      {error && <div className="tui-error">{error}</div>}

      <ToolBlock label={L(lang, '测试文本', 'Test text')}>
        <textarea className="tui-textarea" value={text} onChange={(e) => onText(e.target.value)} rows={5} placeholder={L(lang, '在此粘贴文本', 'Paste text here')} />
      </ToolBlock>

      {pattern && !error && !replaceMode && (
        <>
          <div className="tui-label">
            {L(lang, '匹配结果', 'Matches')}: <b className="mono">{matches.length}</b>
          </div>
          <div className="tui-output tui-highlight">{text ? highlighted : <span className="tui-muted">{L(lang, '无文本', 'No text')}</span>}</div>

          {maxGroups > 0 && matches.length > 0 && (
            <div className="regex-groups">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{L(lang, '匹配', 'Match')}</th>
                    {Array.from({ length: maxGroups }, (_, i) => (
                      <th key={i}>${i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matches.slice(0, 50).map((m, i) => (
                    <tr key={`${m.index}-${i}`}>
                      <td className="mono">{i + 1}</td>
                      <td className="mono">{m.value}</td>
                      {Array.from({ length: maxGroups }, (_, gi) => (
                        <td className="mono" key={gi}>{m.groups[gi] ?? ''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {pattern && !error && replaceMode && (
        <ToolBlock label={L(lang, '替换结果', 'Replaced')} actions={<CopyButton text={replaced} />}>
          <textarea className="tui-textarea" value={replaced} readOnly rows={5} />
        </ToolBlock>
      )}
    </div>
  );
}
