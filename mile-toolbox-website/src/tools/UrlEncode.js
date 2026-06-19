import React, { useState } from 'react';
import { L, CopyButton, ToolBlock, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

export default function UrlEncode({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [component, setComponent] = useState(true);

  const run = (value, m, comp) => {
    setError('');
    if (!value) {
      setOutput('');
      return;
    }
    try {
      if (m === 'encode') {
        setOutput(comp ? encodeURIComponent(value) : encodeURI(value));
      } else {
        setOutput(comp ? decodeURIComponent(value) : decodeURI(value));
      }
      report();
    } catch (e) {
      setOutput('');
      setError(L(lang, '输入无法解析', 'Input cannot be parsed'));
    }
  };

  const onInput = (v) => {
    setInput(v);
    run(v, mode, component);
  };
  const switchMode = (m) => {
    setMode(m);
    const ni = output || input;
    setInput(ni);
    run(ni, m, component);
  };
  const toggleComp = () => {
    const next = !component;
    setComponent(next);
    run(input, mode, next);
  };

  return (
    <div className="tui">
      <div className="tool-tabs">
        <button type="button" className={`tool-tab ${mode === 'encode' ? 'is-active' : ''}`} onClick={() => switchMode('encode')}>
          {L(lang, '编码', 'Encode')}
        </button>
        <button type="button" className={`tool-tab ${mode === 'decode' ? 'is-active' : ''}`} onClick={() => switchMode('decode')}>
          {L(lang, '解码', 'Decode')}
        </button>
      </div>

      <label className="tui-check">
        <input type="checkbox" checked={component} onChange={toggleComp} />
        {L(lang, '按组件编码（encodeURIComponent，转义 ? & = 等）', 'Component mode (encodeURIComponent)')}
      </label>

      <ToolBlock label={L(lang, '输入', 'Input')}>
        <textarea className="tui-textarea" value={input} onChange={(e) => onInput(e.target.value)} rows={5} placeholder="https://example.com/?q=a b&x=1" />
      </ToolBlock>

      <ToolBlock label={L(lang, '输出', 'Output')} actions={<CopyButton text={output} />}>
        <textarea className="tui-textarea" value={error || output} readOnly rows={5} aria-invalid={!!error} placeholder={L(lang, '结果显示在这里', 'Result appears here')} />
      </ToolBlock>
    </div>
  );
}
