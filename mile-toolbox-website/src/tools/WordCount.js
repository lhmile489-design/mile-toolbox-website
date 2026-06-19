import React, { useMemo, useState } from 'react';
import { L, ToolBlock, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

export default function WordCount({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const chars = [...text].length;
    const charsNoSpace = [...text.replace(/\s/g, '')].length;
    const cjk = (text.match(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g) || []).length;
    const enWords = (text.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g) || []).length;
    const words = cjk + enWords;
    const lines = text === '' ? 0 : text.split(/\r\n|\r|\n/).length;
    const bytes = new TextEncoder().encode(text).length;
    // 阅读时长：中文 ~300 字/分，英文 ~200 词/分
    const minutes = cjk / 300 + enWords / 200;
    const readSec = Math.round(minutes * 60);
    return { chars, charsNoSpace, words, lines, bytes, readSec };
  }, [text]);

  const freq = useMemo(() => {
    if (!text) return [];
    const tokens = [
      ...(text.toLowerCase().match(/[a-z0-9]+(?:['-][a-z0-9]+)*/g) || []),
      ...(text.match(/[\u4e00-\u9fa5]/g) || []),
    ];
    const map = new Map();
    tokens.forEach((tk) => map.set(tk, (map.get(tk) || 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [text]);

  const onChange = (v) => {
    setText(v);
    if (v) report();
  };

  const readLabel = stats.readSec >= 60
    ? `${Math.floor(stats.readSec / 60)}m ${stats.readSec % 60}s`
    : `${stats.readSec}s`;

  const items = [
    { k: 'chars', label: L(lang, '字符数', 'Characters'), v: stats.chars },
    { k: 'charsNoSpace', label: L(lang, '字符数(不含空白)', 'No spaces'), v: stats.charsNoSpace },
    { k: 'words', label: L(lang, '词数', 'Words'), v: stats.words },
    { k: 'lines', label: L(lang, '行数', 'Lines'), v: stats.lines },
    { k: 'bytes', label: L(lang, '字节(UTF-8)', 'Bytes'), v: stats.bytes },
    { k: 'read', label: L(lang, '阅读时长', 'Reading time'), v: readLabel },
  ];

  return (
    <div className="tui">
      <ToolBlock label={L(lang, '输入', 'Input')}>
        <textarea
          className="tui-textarea"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          placeholder={L(lang, '在此粘贴或输入文本', 'Paste or type text here')}
        />
      </ToolBlock>
      <div className="tui-stats">
        {items.map((it) => (
          <div className="tui-stat" key={it.k}>
            <span className="tui-stat__num mono">{it.v}</span>
            <span className="tui-stat__label">{it.label}</span>
          </div>
        ))}
      </div>

      {freq.length > 0 && (
        <div className="tui-field">
          <span className="tui-label">{L(lang, '词频 Top 10', 'Top 10 frequency')}</span>
          <div className="freq-list">
            {freq.map(([word, n]) => (
              <span className="freq-item" key={word}>
                <span className="freq-item__word">{word}</span>
                <span className="freq-item__count mono">{n}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
