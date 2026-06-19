import React, { useMemo, useState } from 'react';
import CryptoJS from 'crypto-js';
import { L, CopyButton, ToolBlock, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

const ALGOS = [
  { key: 'MD5', fn: CryptoJS.MD5, hmac: CryptoJS.HmacMD5 },
  { key: 'SHA1', fn: CryptoJS.SHA1, hmac: CryptoJS.HmacSHA1 },
  { key: 'SHA256', fn: CryptoJS.SHA256, hmac: CryptoJS.HmacSHA256 },
  { key: 'SHA512', fn: CryptoJS.SHA512, hmac: CryptoJS.HmacSHA512 },
];

export default function Hash({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [mode, setMode] = useState('text'); // text | file
  const [input, setInput] = useState('');
  const [hmacKey, setHmacKey] = useState('');
  const [upper, setUpper] = useState(false);
  const [fileResults, setFileResults] = useState(null);
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);

  const textResults = useMemo(() => {
    if (mode !== 'text' || !input) return [];
    return ALGOS.map((a) => {
      const wa = hmacKey ? a.hmac(input, hmacKey) : a.fn(input);
      let hex = wa.toString(CryptoJS.enc.Hex);
      if (upper) hex = hex.toUpperCase();
      return { key: hmacKey ? `HMAC-${a.key}` : a.key, value: hex };
    });
  }, [mode, input, hmacKey, upper]);

  const onInput = (v) => {
    setInput(v);
    if (v) report();
  };

  const onFile = (file) => {
    setFileResults(null);
    if (!file) return;
    setFileName(file.name);
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const wa = CryptoJS.lib.WordArray.create(new Uint8Array(reader.result));
        const res = ALGOS.map((a) => {
          let hex = a.fn(wa).toString(CryptoJS.enc.Hex);
          if (upper) hex = hex.toUpperCase();
          return { key: a.key, value: hex };
        });
        setFileResults(res);
        report();
      } finally {
        setBusy(false);
      }
    };
    reader.onerror = () => setBusy(false);
    reader.readAsArrayBuffer(file);
  };

  const results = mode === 'file' ? fileResults || [] : textResults;

  return (
    <div className="tui">
      <div className="tool-tabs">
        <button type="button" className={`tool-tab ${mode === 'text' ? 'is-active' : ''}`} onClick={() => setMode('text')}>
          {L(lang, '文本', 'Text')}
        </button>
        <button type="button" className={`tool-tab ${mode === 'file' ? 'is-active' : ''}`} onClick={() => setMode('file')}>
          {L(lang, '文件', 'File')}
        </button>
      </div>

      {mode === 'text' ? (
        <>
          <ToolBlock label={L(lang, '输入文本', 'Input text')}>
            <textarea className="tui-textarea" value={input} onChange={(e) => onInput(e.target.value)} rows={4} placeholder={L(lang, '输入要计算摘要的文本', 'Text to hash')} />
          </ToolBlock>
          <label className="tui-field">
            <span className="tui-label">{L(lang, 'HMAC 密钥（可选，填了则计算 HMAC）', 'HMAC key (optional → compute HMAC)')}</span>
            <input className="tui-input" value={hmacKey} onChange={(e) => setHmacKey(e.target.value)} placeholder={L(lang, '留空为普通摘要', 'Blank for plain digest')} />
          </label>
        </>
      ) : (
        <label className="pdf-drop">
          <input type="file" hidden onChange={(e) => onFile(e.target.files[0])} />
          <span className="pdf-drop__hint">
            {busy ? L(lang, '计算中…', 'Hashing…') : fileName || L(lang, '选择文件计算哈希（本地，不上传）', 'Choose a file to hash (local, no upload)')}
          </span>
        </label>
      )}

      <label className="tui-check">
        <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} />
        {L(lang, '大写输出', 'Uppercase output')}
      </label>

      {results.map((r) => (
        <div className="tui-field" key={r.key}>
          <span className="tui-label">{r.key}</span>
          <div className="tui-input-row">
            <input className="tui-input mono" value={r.value} readOnly />
            <CopyButton text={r.value} small />
          </div>
        </div>
      ))}
    </div>
  );
}
