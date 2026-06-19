import React, { useMemo, useState } from 'react';
import { L, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

// 各类别单位（factor 相对基准单位的倍数）；温度单独处理
const CATEGORIES = {
  length: {
    label: ['长度', 'Length'],
    units: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 },
  },
  mass: {
    label: ['重量', 'Mass'],
    units: { g: 1, kg: 1000, mg: 0.001, t: 1e6, lb: 453.59237, oz: 28.349523125 },
  },
  area: {
    label: ['面积', 'Area'],
    units: { 'm²': 1, 'km²': 1e6, 'cm²': 1e-4, ha: 1e4, '亩/mu': 666.6667, 'ft²': 0.092903, 'acre': 4046.8564 },
  },
  data: {
    label: ['数据', 'Data'],
    units: { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4, bit: 0.125 },
  },
  time: {
    label: ['时间', 'Time'],
    units: { s: 1, ms: 0.001, min: 60, h: 3600, day: 86400, week: 604800 },
  },
  speed: {
    label: ['速度', 'Speed'],
    units: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704, knot: 0.514444, 'ft/s': 0.3048 },
  },
  pressure: {
    label: ['压强', 'Pressure'],
    units: { Pa: 1, kPa: 1000, bar: 100000, atm: 101325, psi: 6894.757, mmHg: 133.322 },
  },
  energy: {
    label: ['能量', 'Energy'],
    units: { J: 1, kJ: 1000, cal: 4.184, kcal: 4184, Wh: 3600, kWh: 3600000 },
  },
  angle: {
    label: ['角度', 'Angle'],
    units: { 'deg°': 1, rad: 57.29578, grad: 0.9, 'arcmin′': 0.0166667 },
  },
  temperature: {
    label: ['温度', 'Temperature'],
    units: { '°C': 'c', '°F': 'f', K: 'k' },
  },
};

function toCelsius(v, unit) {
  if (unit === '°C') return v;
  if (unit === '°F') return (v - 32) / 1.8;
  return v - 273.15;
}
function fromCelsius(c, unit) {
  if (unit === '°C') return c;
  if (unit === '°F') return c * 1.8 + 32;
  return c + 273.15;
}
function fmt(n) {
  if (!Number.isFinite(n)) return '';
  return Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-6 && n !== 0)
    ? n.toExponential(6)
    : parseFloat(n.toPrecision(10)).toString();
}

export default function UnitConvert({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [cat, setCat] = useState('length');
  const [value, setValue] = useState('1');
  const unitKeys = Object.keys(CATEGORIES[cat].units);
  const [from, setFrom] = useState(unitKeys[0]);

  const results = useMemo(() => {
    const n = parseFloat(value);
    if (Number.isNaN(n)) return [];
    const conf = CATEGORIES[cat];
    if (cat === 'temperature') {
      const c = toCelsius(n, from);
      return Object.keys(conf.units).map((u) => ({ unit: u, val: fmt(fromCelsius(c, u)) }));
    }
    const base = n * conf.units[from];
    return Object.keys(conf.units).map((u) => ({ unit: u, val: fmt(base / conf.units[u]) }));
  }, [cat, value, from]);

  const changeCat = (c) => {
    setCat(c);
    setFrom(Object.keys(CATEGORIES[c].units)[0]);
  };

  const onValue = (v) => {
    setValue(v);
    if (v) report();
  };

  return (
    <div className="tui">
      <div className="tui-row">
        <label className="tui-field tui-field--sm">
          <span className="tui-label">{L(lang, '类别', 'Category')}</span>
          <select className="tui-input" value={cat} onChange={(e) => changeCat(e.target.value)}>
            {Object.keys(CATEGORIES).map((c) => (
              <option key={c} value={c}>{CATEGORIES[c].label[lang === 'en' ? 1 : 0]}</option>
            ))}
          </select>
        </label>
        <label className="tui-field tui-field--sm">
          <span className="tui-label">{L(lang, '数值', 'Value')}</span>
          <input className="tui-input mono" value={value} onChange={(e) => onValue(e.target.value)} placeholder="1" />
        </label>
        <label className="tui-field tui-field--sm">
          <span className="tui-label">{L(lang, '单位', 'From unit')}</span>
          <select className="tui-input" value={from} onChange={(e) => setFrom(e.target.value)}>
            {unitKeys.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="tui-stats">
        {results.map((r) => (
          <div className={`tui-stat ${r.unit === from ? 'is-from' : ''}`} key={r.unit}>
            <span className="tui-stat__num mono" style={{ fontSize: '1.05rem' }}>{r.val}</span>
            <span className="tui-stat__label">{r.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
