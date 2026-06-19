import React, { useEffect, useState } from 'react';
import { L, CopyButton, ToolBlock, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

const ZONES = [
  { key: 'local', label: ['本地', 'Local'], tz: undefined },
  { key: 'utc', label: ['UTC', 'UTC'], tz: 'UTC' },
  { key: 'sh', label: ['北京', 'Beijing'], tz: 'Asia/Shanghai' },
  { key: 'tokyo', label: ['东京', 'Tokyo'], tz: 'Asia/Tokyo' },
  { key: 'london', label: ['伦敦', 'London'], tz: 'Europe/London' },
  { key: 'ny', label: ['纽约', 'New York'], tz: 'America/New_York' },
];

function fmt(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function fmtTz(ms, tz) {
  if (!tz) return fmt(new Date(ms));
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).formatToParts(new Date(ms));
    const g = (t) => parts.find((x) => x.type === t)?.value || '';
    return `${g('year')}-${g('month')}-${g('day')} ${g('hour')}:${g('minute')}:${g('second')}`;
  } catch (e) {
    return fmt(new Date(ms));
  }
}

export default function Timestamp({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [now, setNow] = useState(Date.now());
  const [zone, setZone] = useState('local');
  const [ts, setTs] = useState('');
  const [tsResult, setTsResult] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [dateResult, setDateResult] = useState('');

  const tzOf = (key) => ZONES.find((z) => z.key === key)?.tz;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const tsToDate = (v, z) => {
    setTs(v);
    const n = Number(v);
    if (!v || Number.isNaN(n)) {
      setTsResult('');
      return;
    }
    const ms = String(Math.trunc(n)).length <= 10 ? n * 1000 : n;
    const d = new Date(ms);
    setTsResult(Number.isNaN(d.getTime()) ? L(lang, '无效时间戳', 'Invalid timestamp') : fmtTz(ms, tzOf(z)));
    report();
  };

  const dateToTs = (v) => {
    setDateStr(v);
    if (!v) {
      setDateResult('');
      return;
    }
    const d = new Date(v.replace(/-/g, '/'));
    if (Number.isNaN(d.getTime())) {
      setDateResult(L(lang, '无效日期，格式如 2026-06-18 12:00:00', 'Invalid date, e.g. 2026-06-18 12:00:00'));
      return;
    }
    setDateResult(`${Math.floor(d.getTime() / 1000)} (s)  ·  ${d.getTime()} (ms)`);
    report();
  };

  return (
    <div className="tui">
      <div className="tui-now">
        <div>
          <span className="tui-now__label">{L(lang, '当前时间戳(秒)', 'Now (seconds)')}</span>
          <span className="tui-now__val mono">{Math.floor(now / 1000)}</span>
        </div>
        <div>
          <span className="tui-now__label">{L(lang, '当前时间戳(毫秒)', 'Now (ms)')}</span>
          <span className="tui-now__val mono">{now}</span>
        </div>
        <div>
          <span className="tui-now__label">{L(lang, '本地时间', 'Local time')}</span>
          <span className="tui-now__val mono">{fmt(new Date(now))}</span>
        </div>
      </div>

      <label className="tui-field tui-field--sm">
        <span className="tui-label">{L(lang, '时区', 'Time zone')}</span>
        <select className="tui-input" value={zone} onChange={(e) => { setZone(e.target.value); tsToDate(ts, e.target.value); }}>
          {ZONES.map((z) => (
            <option key={z.key} value={z.key}>{z.label[lang === 'en' ? 1 : 0]}</option>
          ))}
        </select>
      </label>

      <ToolBlock label={L(lang, '时间戳 → 日期', 'Timestamp → Date')} actions={<CopyButton text={tsResult} small />}>
        <input className="tui-input" value={ts} onChange={(e) => tsToDate(e.target.value, zone)} placeholder={L(lang, '输入秒或毫秒时间戳', 'Enter seconds or ms timestamp')} />
        {tsResult && <div className="tui-output mono">{tsResult}</div>}
      </ToolBlock>

      <ToolBlock label={L(lang, '日期 → 时间戳', 'Date → Timestamp')} actions={<CopyButton text={dateResult} small />}>
        <input className="tui-input" value={dateStr} onChange={(e) => dateToTs(e.target.value)} placeholder="2026-06-18 12:00:00" />
        {dateResult && <div className="tui-output mono">{dateResult}</div>}
      </ToolBlock>
    </div>
  );
}

