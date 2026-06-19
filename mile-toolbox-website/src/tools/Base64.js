import React, { useState } from 'react';
import { L, CopyButton, ToolBlock, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

function encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function decode(str) {
  return decodeURIComponent(escape(atob(str.trim())));
}

export default function Base64({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [mode, setMode] = useState('encode'); // encode | decode | image
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [imgSrc, setImgSrc] = useState('');

  const run = (value, m) => {
    setError('');
    if (!value) {
      setOutput('');
      return;
    }
    try {
      setOutput(m === 'encode' ? encode(value) : decode(value));
      report();
    } catch (e) {
      setOutput('');
      setError(L(lang, '输入不是有效的 Base64', 'Input is not valid Base64'));
    }
  };

  const onInput = (v) => {
    setInput(v);
    run(v, mode);
  };
  const switchMode = (m) => {
    setMode(m);
    setError('');
    if (m === 'image') return;
    const newInput = output || input;
    setInput(newInput);
    run(newInput, m);
  };

  const onImage = (file) => {
    setError('');
    setOutput('');
    setImgSrc('');
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setOutput(String(reader.result));
      setImgSrc(String(reader.result));
      report();
    };
    reader.onerror = () => setError(L(lang, '图片读取失败', 'Failed to read image'));
    reader.readAsDataURL(file);
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
        <button type="button" className={`tool-tab ${mode === 'image' ? 'is-active' : ''}`} onClick={() => switchMode('image')}>
          {L(lang, '图片', 'Image')}
        </button>
      </div>

      {mode === 'image' ? (
        <>
          <label className="pdf-drop">
            <input type="file" hidden accept="image/*" onChange={(e) => onImage(e.target.files[0])} />
            <span className="pdf-drop__hint">{L(lang, '选择图片转 Base64 / Data URL', 'Choose an image → Base64 / Data URL')}</span>
          </label>
          {imgSrc && <img className="base64-preview" src={imgSrc} alt="preview" />}
          {output && (
            <ToolBlock label={L(lang, 'Data URL', 'Data URL')} actions={<CopyButton text={output} />}>
              <textarea className="tui-textarea tui-textarea--mono" value={output} readOnly rows={5} />
            </ToolBlock>
          )}
        </>
      ) : (
        <>
          <ToolBlock label={L(lang, '输入', 'Input')}>
            <textarea
              className="tui-textarea"
              value={input}
              onChange={(e) => onInput(e.target.value)}
              placeholder={mode === 'encode' ? L(lang, '输入要编码的文本', 'Text to encode') : L(lang, '输入 Base64 字符串', 'Base64 string to decode')}
              rows={5}
            />
          </ToolBlock>
          <ToolBlock label={L(lang, '输出', 'Output')} actions={<CopyButton text={output} />}>
            <textarea className="tui-textarea" value={error || output} readOnly rows={5} aria-invalid={!!error} placeholder={L(lang, '结果显示在这里', 'Result appears here')} />
          </ToolBlock>
        </>
      )}
    </div>
  );
}
