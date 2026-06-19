import React, { useState } from 'react';
import { L, CopyButton, ToolBlock, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

function uuidv4() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
function uuidv7() {
  const ts = Date.now();
  const bytes = new Uint8Array(16);
  bytes[0] = Math.floor(ts / 2 ** 40) & 0xff;
  bytes[1] = Math.floor(ts / 2 ** 32) & 0xff;
  bytes[2] = Math.floor(ts / 2 ** 24) & 0xff;
  bytes[3] = Math.floor(ts / 2 ** 16) & 0xff;
  bytes[4] = Math.floor(ts / 2 ** 8) & 0xff;
  bytes[5] = ts & 0xff;
  const rnd = new Uint8Array(10);
  (crypto.getRandomValues ? crypto : { getRandomValues: (a) => a.forEach((_, i) => { a[i] = (Math.random() * 256) | 0; }) }).getRandomValues(rnd);
  bytes.set(rnd, 6);
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
function nanoid(size = 21) {
  const alphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
  const bytes = new Uint8Array(size);
  if (crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < size; i += 1) bytes[i] = (Math.random() * 256) | 0;
  let id = '';
  for (let i = 0; i < size; i += 1) id += alphabet[bytes[i] & 63];
  return id;
}

export default function Uuid({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [count, setCount] = useState(5);
  const [version, setVersion] = useState('v4');
  const [upper, setUpper] = useState(false);
  const [hyphen, setHyphen] = useState(true);
  const [list, setList] = useState([]);

  const generate = () => {
    const n = Math.min(Math.max(parseInt(count, 10) || 1, 1), 200);
    const arr = Array.from({ length: n }, () => {
      if (version === 'nanoid') return nanoid();
      let u = version === 'v7' ? uuidv7() : uuidv4();
      if (!hyphen) u = u.replace(/-/g, '');
      if (upper) u = u.toUpperCase();
      return u;
    });
    setList(arr);
    report();
  };

  const text = list.join('\n');
  const isUuid = version !== 'nanoid';

  return (
    <div className="tui">
      <div className="tui-row">
        <label className="tui-field tui-field--sm">
          <span className="tui-label">{L(lang, '类型', 'Type')}</span>
          <select className="tui-input" value={version} onChange={(e) => setVersion(e.target.value)}>
            <option value="v4">UUID v4</option>
            <option value="v7">UUID v7</option>
            <option value="nanoid">NanoID</option>
          </select>
        </label>
        <label className="tui-field tui-field--sm">
          <span className="tui-label">{L(lang, '数量', 'Count')}</span>
          <input type="number" min={1} max={200} value={count} onChange={(e) => setCount(e.target.value)} className="tui-input" />
        </label>
        {isUuid && (
          <>
            <label className="tui-check">
              <input type="checkbox" checked={hyphen} onChange={(e) => setHyphen(e.target.checked)} />
              {L(lang, '带连字符', 'Hyphens')}
            </label>
            <label className="tui-check">
              <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} />
              {L(lang, '大写', 'Uppercase')}
            </label>
          </>
        )}
        <button type="button" className="btn btn--cta" onClick={generate}>
          {L(lang, '生成', 'Generate')}
        </button>
      </div>

      {list.length > 0 && (
        <ToolBlock label={L(lang, '结果', 'Result')} actions={<CopyButton text={text} />}>
          <textarea className="tui-textarea tui-textarea--mono" value={text} readOnly rows={Math.min(list.length, 12)} />
        </ToolBlock>
      )}
    </div>
  );
}
