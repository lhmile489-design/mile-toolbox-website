import React, { useMemo, useState } from 'react';
import { diffLines, diffWords } from 'diff';
import { L, ToolBlock, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

export default function TextDiff({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [byWord, setByWord] = useState(false);

  const parts = useMemo(() => {
    if (!a && !b) return null;
    report();
    return byWord ? diffWords(a, b) : diffLines(a, b);
  }, [a, b, byWord, report]);

  const stats = useMemo(() => {
    if (!parts) return { add: 0, del: 0 };
    let add = 0;
    let del = 0;
    parts.forEach((p) => {
      if (p.added) add += p.count || 1;
      else if (p.removed) del += p.count || 1;
    });
    return { add, del };
  }, [parts]);

  return (
    <div className="tui">
      <div className="diff-inputs">
        <ToolBlock label={L(lang, '原文 A', 'Original A')}>
          <textarea className="tui-textarea tui-textarea--mono" value={a} onChange={(e) => setA(e.target.value)} rows={7} />
        </ToolBlock>
        <ToolBlock label={L(lang, '对比 B', 'Changed B')}>
          <textarea className="tui-textarea tui-textarea--mono" value={b} onChange={(e) => setB(e.target.value)} rows={7} />
        </ToolBlock>
      </div>

      <label className="tui-check">
        <input type="checkbox" checked={byWord} onChange={(e) => setByWord(e.target.checked)} />
        {L(lang, '按词对比（默认按行）', 'Diff by word (default by line)')}
      </label>

      {parts && (
        <>
          <div className="tui-label">
            <span style={{ color: '#1c7a47' }}>+{stats.add}</span> · <span style={{ color: '#c62a2f' }}>-{stats.del}</span>
          </div>
          <div className="tui-output diff-view">
            {parts.map((p, i) => (
              <span key={i} className={p.added ? 'diff-add' : p.removed ? 'diff-del' : ''}>{p.value}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
