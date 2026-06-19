import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { L, CopyButton, ToolBlock, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

const ALGOS = {
  AES: CryptoJS.AES,
  DES: CryptoJS.DES,
  TripleDES: CryptoJS.TripleDES,
};

export default function TextCrypto({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [mode, setMode] = useState('encrypt');
  const [algo, setAlgo] = useState('AES');
  const [key, setKey] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const run = (m, a, k, text) => {
    setError('');
    if (!text || !k) {
      setOutput('');
      return;
    }
    try {
      const lib = ALGOS[a];
      if (m === 'encrypt') {
        setOutput(lib.encrypt(text, k).toString());
      } else {
        const bytes = lib.decrypt(text.trim(), k);
        const plain = bytes.toString(CryptoJS.enc.Utf8);
        if (!plain) throw new Error('bad');
        setOutput(plain);
      }
      report();
    } catch (e) {
      setOutput('');
      setError(m === 'decrypt' ? L(lang, '解密失败：密钥错误或密文无效', 'Decryption failed: wrong key or invalid ciphertext') : L(lang, '加密失败', 'Encryption failed'));
    }
  };

  const upd = (patch) => {
    const next = { mode, algo, key, input, ...patch };
    setMode(next.mode);
    setAlgo(next.algo);
    setKey(next.key);
    setInput(next.input);
    run(next.mode, next.algo, next.key, next.input);
  };

  return (
    <div className="tui">
      <div className="tool-tabs">
        <button type="button" className={`tool-tab ${mode === 'encrypt' ? 'is-active' : ''}`} onClick={() => upd({ mode: 'encrypt', input: output || input })}>
          {L(lang, '加密', 'Encrypt')}
        </button>
        <button type="button" className={`tool-tab ${mode === 'decrypt' ? 'is-active' : ''}`} onClick={() => upd({ mode: 'decrypt', input: output || input })}>
          {L(lang, '解密', 'Decrypt')}
        </button>
      </div>

      <div className="tui-row">
        <label className="tui-field tui-field--sm">
          <span className="tui-label">{L(lang, '算法', 'Algorithm')}</span>
          <select className="tui-input" value={algo} onChange={(e) => upd({ algo: e.target.value })}>
            <option value="AES">AES</option>
            <option value="DES">DES</option>
            <option value="TripleDES">TripleDES (3DES)</option>
          </select>
        </label>
        <label className="tui-field" style={{ flex: 1, minWidth: 200 }}>
          <span className="tui-label">{L(lang, '密钥', 'Secret key')}</span>
          <input className="tui-input" value={key} onChange={(e) => upd({ key: e.target.value })} placeholder={L(lang, '输入密钥/口令', 'Enter a passphrase')} />
        </label>
      </div>

      <ToolBlock label={mode === 'encrypt' ? L(lang, '明文', 'Plain text') : L(lang, '密文', 'Ciphertext')}>
        <textarea className="tui-textarea" value={input} onChange={(e) => upd({ input: e.target.value })} rows={4} />
      </ToolBlock>

      {error && <div className="tui-error">{error}</div>}

      <ToolBlock label={mode === 'encrypt' ? L(lang, '密文', 'Ciphertext') : L(lang, '明文', 'Plain text')} actions={<CopyButton text={output} />}>
        <textarea className="tui-textarea tui-textarea--mono" value={output} readOnly rows={4} placeholder={L(lang, '结果显示在这里', 'Result appears here')} />
      </ToolBlock>

      <p className="tui-muted" style={{ fontSize: '0.8rem' }}>
        {L(lang, '说明：基于 crypto-js，密文为 OpenSSL 兼容格式。RSA 非对称加密将后续支持。', 'Note: powered by crypto-js (OpenSSL-compatible). RSA will be added later.')}
      </p>
    </div>
  );
}
