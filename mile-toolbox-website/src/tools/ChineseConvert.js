import React, { useMemo, useState } from 'react';
import * as OpenCC from 'opencc-js';
import { L, CopyButton, ToolBlock, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

// 转换器创建有一定开销，按方向缓存
const converters = {};
function getConverter(dir) {
  if (!converters[dir]) {
    converters[dir] = dir === 's2t'
      ? OpenCC.Converter({ from: 'cn', to: 'tw' })
      : OpenCC.Converter({ from: 'tw', to: 'cn' });
  }
  return converters[dir];
}

export default function ChineseConvert({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [dir, setDir] = useState('s2t'); // s2t 简→繁 | t2s 繁→简
  const [input, setInput] = useState('');

  const output = useMemo(() => {
    if (!input) return '';
    try {
      const out = getConverter(dir)(input);
      report();
      return out;
    } catch (e) {
      return '';
    }
  }, [input, dir, report]);

  return (
    <div className="tui">
      <div className="tool-tabs">
        <button type="button" className={`tool-tab ${dir === 's2t' ? 'is-active' : ''}`} onClick={() => setDir('s2t')}>
          {L(lang, '简 → 繁', 'Simplified → Traditional')}
        </button>
        <button type="button" className={`tool-tab ${dir === 't2s' ? 'is-active' : ''}`} onClick={() => setDir('t2s')}>
          {L(lang, '繁 → 简', 'Traditional → Simplified')}
        </button>
      </div>

      <ToolBlock label={L(lang, '输入', 'Input')}>
        <textarea className="tui-textarea" value={input} onChange={(e) => setInput(e.target.value)} rows={5} placeholder={dir === 's2t' ? L(lang, '输入简体中文', 'Enter Simplified Chinese') : L(lang, '输入繁体中文', 'Enter Traditional Chinese')} />
      </ToolBlock>

      <ToolBlock label={L(lang, '输出', 'Output')} actions={<CopyButton text={output} />}>
        <textarea className="tui-textarea" value={output} readOnly rows={5} placeholder={L(lang, '结果显示在这里', 'Result appears here')} />
      </ToolBlock>
    </div>
  );
}
