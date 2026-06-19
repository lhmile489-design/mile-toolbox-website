import React, { useState } from 'react';
import Icon from '../components/Icons';
import { L, CopyButton, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

const PRESETS = [
  ['#FF8C42', '#F2741C'],
  ['#0EA5E9', '#6366F1'],
  ['#EC4899', '#8B5CF6'],
  ['#14B8A6', '#0EA5E9'],
  ['#F59E0B', '#EF4444'],
  ['#2A211A', '#6B5D52'],
];

export default function Gradient({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [stops, setStops] = useState([
    { color: '#FF8C42', pos: 0 },
    { color: '#0EA5E9', pos: 100 },
  ]);
  const [angle, setAngle] = useState(135);
  const [type, setType] = useState('linear');

  const stopStr = stops.map((s) => `${s.color} ${s.pos}%`).join(', ');
  const css =
    type === 'linear' ? `linear-gradient(${angle}deg, ${stopStr})`
      : type === 'radial' ? `radial-gradient(circle, ${stopStr})`
        : `conic-gradient(from ${angle}deg, ${stopStr})`;
  const full = `background: ${css};`;

  const touch = () => report();
  const setStop = (i, patch) => {
    setStops((arr) => arr.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
    touch();
  };
  const addStop = () => {
    setStops((arr) => [...arr, { color: '#FFFFFF', pos: 50 }]);
    touch();
  };
  const removeStop = (i) => {
    setStops((arr) => (arr.length > 2 ? arr.filter((_, idx) => idx !== i) : arr));
  };
  const applyPreset = (p) => {
    setStops(p.map((color, idx) => ({ color, pos: Math.round((idx / (p.length - 1)) * 100) })));
    touch();
  };

  return (
    <div className="tui">
      <div className="tui-gradient-preview" style={{ backgroundImage: css }} />

      <div className="tui-row">
        <label className="tui-field tui-field--sm">
          <span className="tui-label">{L(lang, '类型', 'Type')}</span>
          <select className="tui-input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="linear">{L(lang, '线性', 'Linear')}</option>
            <option value="radial">{L(lang, '径向', 'Radial')}</option>
            <option value="conic">{L(lang, '锥形', 'Conic')}</option>
          </select>
        </label>
        {type !== 'radial' && (
          <label className="tui-field" style={{ flex: 1, minWidth: 160 }}>
            <span className="tui-label">{L(lang, '角度', 'Angle')}: <b className="mono">{angle}°</b></span>
            <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="tui-range" />
          </label>
        )}
      </div>

      <div className="tui-field">
        <span className="tui-label">{L(lang, '色标', 'Color stops')}</span>
        {stops.map((s, i) => (
          <div className="tui-input-row" key={i} style={{ marginBottom: 8 }}>
            <input type="color" className="tui-color__picker" value={s.color} onChange={(e) => setStop(i, { color: e.target.value })} />
            <input className="tui-input mono" value={s.color} onChange={(e) => setStop(i, { color: e.target.value })} />
            <input type="number" className="tui-input" style={{ maxWidth: 80 }} min={0} max={100} value={s.pos} onChange={(e) => setStop(i, { pos: Number(e.target.value) })} />
            <button type="button" className="tui-copy tui-copy--sm" onClick={() => removeStop(i)} disabled={stops.length <= 2} aria-label="remove">
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
        <button type="button" className="btn btn--ghost" onClick={addStop} style={{ alignSelf: 'flex-start' }}>
          + {L(lang, '添加色标', 'Add stop')}
        </button>
      </div>

      <div className="tui-field">
        <span className="tui-label">{L(lang, '预设', 'Presets')}</span>
        <div className="swatch-grid">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              type="button"
              className="gradient-preset"
              style={{ backgroundImage: `linear-gradient(135deg, ${p.join(', ')})` }}
              onClick={() => applyPreset(p)}
              aria-label={`preset ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="tui-field">
        <span className="tui-label">CSS</span>
        <div className="tui-input-row">
          <input className="tui-input mono" value={full} readOnly />
          <CopyButton text={full} small />
        </div>
      </div>
    </div>
  );
}
