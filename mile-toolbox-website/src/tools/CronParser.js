import React, { useMemo, useState } from 'react';
import { L, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

function parseField(expr, min, max) {
  const out = new Set();
  expr.split(',').forEach((tokenRaw) => {
    let token = tokenRaw.trim();
    let step = 1;
    const slash = token.indexOf('/');
    if (slash !== -1) {
      step = parseInt(token.slice(slash + 1), 10);
      token = token.slice(0, slash);
      if (!step || step < 1) throw new Error('bad step');
    }
    let lo = min;
    let hi = max;
    if (token === '*' || token === '') {
      // full range
    } else if (token.includes('-')) {
      const [a, b] = token.split('-').map((x) => parseInt(x, 10));
      if (Number.isNaN(a) || Number.isNaN(b)) throw new Error('bad range');
      lo = a;
      hi = b;
    } else {
      const v = parseInt(token, 10);
      if (Number.isNaN(v)) throw new Error('bad value');
      lo = v;
      hi = v;
    }
    if (lo < min || hi > max || lo > hi) throw new Error('out of range');
    for (let i = lo; i <= hi; i += step) out.add(i);
  });
  return out;
}

function parseCron(expr) {
  const f = expr.trim().split(/\s+/);
  if (f.length !== 5) throw new Error(`expects 5 fields, got ${f.length}`);
  return {
    minute: parseField(f[0], 0, 59),
    hour: parseField(f[1], 0, 23),
    dom: parseField(f[2], 1, 31),
    month: parseField(f[3], 1, 12),
    dow: parseField(f[4], 0, 6),
    raw: f,
  };
}

function nextRuns(cron, from, count) {
  const res = [];
  const d = new Date(from.getTime());
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);
  const domStar = cron.raw[2] === '*';
  const dowStar = cron.raw[4] === '*';
  let guard = 0;
  while (res.length < count && guard < 750000) {
    guard += 1;
    const domMatch = cron.dom.has(d.getDate());
    const dowMatch = cron.dow.has(d.getDay());
    const dayOk = domStar || dowStar ? domMatch && dowMatch : domMatch || dowMatch;
    if (
      cron.minute.has(d.getMinutes()) &&
      cron.hour.has(d.getHours()) &&
      cron.month.has(d.getMonth() + 1) &&
      dayOk
    ) {
      res.push(new Date(d.getTime()));
    }
    d.setMinutes(d.getMinutes() + 1);
  }
  return res;
}

export default function CronParser({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [expr, setExpr] = useState('*/5 * * * *');

  const result = useMemo(() => {
    if (!expr.trim()) return null;
    try {
      const cron = parseCron(expr);
      const runs = nextRuns(cron, new Date(), 6);
      report();
      return { cron, runs };
    } catch (e) {
      return { error: e.message };
    }
  }, [expr, report]);

  const labels = [
    L(lang, '分钟 (0-59)', 'Minute (0-59)'),
    L(lang, '小时 (0-23)', 'Hour (0-23)'),
    L(lang, '日 (1-31)', 'Day (1-31)'),
    L(lang, '月 (1-12)', 'Month (1-12)'),
    L(lang, '周 (0-6)', 'Weekday (0-6)'),
  ];

  return (
    <div className="tui">
      <label className="tui-field">
        <span className="tui-label">{L(lang, 'Cron 表达式（5 段）', 'Cron expression (5 fields)')}</span>
        <input className="tui-input mono" value={expr} onChange={(e) => setExpr(e.target.value)} placeholder="*/5 * * * *" aria-invalid={!!(result && result.error)} />
      </label>

      {result && result.error && (
        <div className="tui-error">{L(lang, '解析失败：', 'Parse error: ')}{result.error}</div>
      )}

      {result && result.cron && (
        <>
          <div className="tui-stats">
            {result.cron.raw.map((v, i) => (
              <div className="tui-stat" key={i}>
                <span className="tui-stat__num mono" style={{ fontSize: '1.05rem' }}>{v}</span>
                <span className="tui-stat__label">{labels[i]}</span>
              </div>
            ))}
          </div>
          <div className="tui-field">
            <span className="tui-label">{L(lang, '接下来 6 次执行', 'Next 6 runs')}</span>
            <div className="tui-output">
              {result.runs.length ? (
                <ul className="cron-runs">
                  {result.runs.map((r, i) => (
                    <li key={i} className="mono">{r.toLocaleString()}</li>
                  ))}
                </ul>
              ) : (
                <span className="tui-muted">{L(lang, '未来一年内无匹配时间', 'No matching time within a year')}</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
