import React, { useState } from 'react';
import { L, CopyButton, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}
function rgbToHsl({ r, g, b }) {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rr: h = ((gg - bb) / d) % 6; break;
      case gg: h = (bb - rr) / d + 2; break;
      default: h = (rr - gg) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function rgbToHsv({ r, g, b }) {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rr) h = ((gg - bb) / d) % 6;
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(max * 100) };
}
function rgbToCmyk({ r, g, b }) {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rr - k) / (1 - k)) * 100),
    m: Math.round(((1 - gg - k) / (1 - k)) * 100),
    y: Math.round(((1 - bb - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}
function luminance({ r, g, b }) {
  const a = [r, g, b].map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function contrast(rgb, other) {
  const l1 = luminance(rgb);
  const l2 = luminance(other);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return Math.round(ratio * 100) / 100;
}

export default function ColorConvert({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [hex, setHex] = useState('#0EA5E9');
  const [error, setError] = useState('');

  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(rgb) : null;
  const hsv = rgb ? rgbToHsv(rgb) : null;
  const cmyk = rgb ? rgbToCmyk(rgb) : null;

  const onHex = (v) => {
    setHex(v);
    const ok = hexToRgb(v);
    setError(ok ? '' : L(lang, '无效的 HEX 颜色', 'Invalid HEX color'));
    if (ok) report();
  };

  const rows = rgb
    ? [
        { label: 'HEX', value: hex.toUpperCase() },
        { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
        { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
        { label: 'HSV', value: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
        { label: 'CMYK', value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
      ]
    : [];

  const cWhite = rgb ? contrast(rgb, { r: 255, g: 255, b: 255 }) : 0;
  const cBlack = rgb ? contrast(rgb, { r: 0, g: 0, b: 0 }) : 0;
  const grade = (ratio) => (ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA Large' : '✗');

  return (
    <div className="tui">
      <div className="tui-color">
        <div className="tui-color__swatch" style={{ background: error ? '#ccc' : hex }} />
        <input type="color" value={rgb ? (hex.length === 4 ? hex : hex.slice(0, 7)) : '#000000'} onChange={(e) => onHex(e.target.value)} className="tui-color__picker" aria-label={L(lang, '选择颜色', 'Pick color')} />
        <input className="tui-input mono" value={hex} onChange={(e) => onHex(e.target.value)} placeholder="#0EA5E9" aria-invalid={!!error} />
      </div>
      {error && <div className="tui-error">{error}</div>}

      {!error && rows.map((r) => (
        <div className="tui-field" key={r.label}>
          <span className="tui-label">{r.label}</span>
          <div className="tui-input-row">
            <input className="tui-input mono" value={r.value} readOnly />
            <CopyButton text={r.value} small />
          </div>
        </div>
      ))}

      {!error && rgb && (
        <div className="tui-field">
          <span className="tui-label">{L(lang, 'WCAG 对比度', 'WCAG contrast')}</span>
          <div className="tui-stats">
            <div className="tui-stat" style={{ background: '#fff', color: hex }}>
              <span className="tui-stat__num" style={{ color: hex }}>{cWhite}</span>
              <span className="tui-stat__label" style={{ color: '#666' }}>{L(lang, '对白色', 'vs White')} · {grade(cWhite)}</span>
            </div>
            <div className="tui-stat" style={{ background: '#000', color: hex }}>
              <span className="tui-stat__num" style={{ color: hex }}>{cBlack}</span>
              <span className="tui-stat__label" style={{ color: '#aaa' }}>{L(lang, '对黑色', 'vs Black')} · {grade(cBlack)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
