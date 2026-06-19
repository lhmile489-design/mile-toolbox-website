import React, { useMemo, useState } from 'react';
import { L, CopyButton, ToolBlock, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

export default function TextDedup({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [input, setInput] = useState('');
  const [trim, setTrim] = useState(true);
  const [dropEmpty, setDropEmpty] = useState(true);
  const [dedup, setDedup] = useState(true);
  const [ci, setCi] = useState(false);
  const [sort, setSort] = useState('none'); // none | asc | desc

  const { output, removed } = useMemo(() => {
    if (!input) return { output: '', removed: 0 };
    let lines = input.split(/\r\n|\r|\n/);
    const before = lines.length;
    if (trim) lines = lines.map((l) => l.trim());
    if (dropEmpty) lines = lines.filter((l) => l !== '');
    if (dedup) {
      const seen = new Set();
      lines = lines.filter((l) => {
        const k = ci ? l.toLowerCase() : l;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    }
    if (sort !== 'none') {
      lines.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      if (sort === 'desc') lines.reverse();
    }
    return { output: lines.join('\n'), removed: before - lines.length };
  }, [input, trim, dropEmpty, dedup, ci, sort]);

  const onInput = (v) => {
    setInput(v);
    if (v) report();
  };

  return (
    <div className="tui">
      <ToolBlock label={L(lang, '输入（按行处理）', 'Input (line by line)')}>
        <textarea className="tui-textarea" value={input} onChange={(e) => onInput(e.target.value)} rows={7} placeholder={L(lang, '每行一条', 'One item per line')} />
      </ToolBlock>

      <div className="tui-row">
        <label className="tui-check"><input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} />{L(lang, '去首尾空白', 'Trim')}</label>
        <label className="tui-check"><input type="checkbox" checked={dropEmpty} onChange={(e) => setDropEmpty(e.target.checked)} />{L(lang, '去空行', 'Drop empty')}</label>
        <label className="tui-check"><input type="checkbox" checked={dedup} onChange={(e) => setDedup(e.target.checked)} />{L(lang, '去重', 'Dedupe')}</label>
        <label className="tui-check"><input type="checkbox" checked={ci} onChange={(e) => setCi(e.target.checked)} />{L(lang, '忽略大小写', 'Ignore case')}</label>
        <label className="tui-field tui-field--sm">
          <span className="tui-label">{L(lang, '排序', 'Sort')}</span>
          <select className="tui-input" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="none">{L(lang, '不排序', 'None')}</option>
            <option value="asc">A→Z</option>
            <option value="desc">Z→A</option>
          </select>
        </label>
      </div>

      <ToolBlock
        label={`${L(lang, '输出', 'Output')}（${L(lang, '移除', 'removed')} ${removed} ${L(lang, '行', 'lines')}）`}
        actions={<CopyButton text={output} />}
      >
        <textarea className="tui-textarea" value={output} readOnly rows={7} />
      </ToolBlock>
    </div>
  );
}
