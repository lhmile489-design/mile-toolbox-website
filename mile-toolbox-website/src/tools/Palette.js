import React, { useMemo, useState } from 'react';
import { L, ColorSwatch, CopyButton, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

function hexToHsl(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue = (hue * 60 + 360) % 360;
  }
  return { h: hue, s, l };
}
function hslToHex(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

// 从图片采样 + 简易量化提取主色
function extractColors(img, k = 6) {
  const w = 80;
  const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    // 量化到 4 位/通道，归桶
    const r = data[i] >> 5;
    const g = data[i + 1] >> 5;
    const b = data[i + 2] >> 5;
    const key = (r << 6) | (g << 3) | b;
    const cur = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
    cur.r += data[i];
    cur.g += data[i + 1];
    cur.b += data[i + 2];
    cur.n += 1;
    buckets.set(key, cur);
  }
  return [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, k)
    .map((c) => {
      const to = (v) => Math.round(v / c.n).toString(16).padStart(2, '0');
      return `#${to(c.r)}${to(c.g)}${to(c.b)}`.toUpperCase();
    });
}

export default function Palette({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [base, setBase] = useState('#FF8C42');
  const [extracted, setExtracted] = useState(null);

  const groups = useMemo(() => {
    const { h, s } = hexToHsl(base);
    const monos = [0.9, 0.75, 0.6, 0.45, 0.3, 0.18].map((l) => hslToHex(h, Math.min(s, 0.85), l));
    const complementary = [hslToHex(h, s, 0.55), hslToHex((h + 180) % 360, s, 0.55)];
    const analogous = [hslToHex((h + 330) % 360, s, 0.55), hslToHex(h, s, 0.55), hslToHex((h + 30) % 360, s, 0.55)];
    const triadic = [hslToHex(h, s, 0.55), hslToHex((h + 120) % 360, s, 0.55), hslToHex((h + 240) % 360, s, 0.55)];
    return { monos, complementary, analogous, triadic };
  }, [base]);

  const onBase = (v) => {
    setBase(v);
    report();
  };
  const random = () => {
    const hex = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`.toUpperCase();
    onBase(hex);
  };
  const onImage = (file) => {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      setExtracted(extractColors(img, 6));
      report();
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  };

  const exportColors = extracted && extracted.length ? extracted : groups.monos;
  const exportCss = `:root {\n${exportColors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`;
  const exportJson = JSON.stringify(exportColors, null, 2);

  const section = (title, colors) => (
    <div className="tui-field">
      <span className="tui-label">{title}</span>
      <div className="swatch-grid">
        {colors.map((c, i) => (
          <ColorSwatch key={`${c}-${i}`} color={c} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="tui">
      <div className="tui-row">
        <label className="tui-field tui-field--sm">
          <span className="tui-label">{L(lang, '基准色', 'Base color')}</span>
          <input type="color" value={base} onChange={(e) => onBase(e.target.value)} className="tui-color__picker" />
        </label>
        <input className="tui-input mono tui-field--sm" value={base} onChange={(e) => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && onBase(e.target.value)} />
        <button type="button" className="btn btn--ghost" onClick={random}>{L(lang, '随机', 'Random')}</button>
        <label className="btn btn--ghost" style={{ cursor: 'pointer' }}>
          {L(lang, '从图片提取', 'From image')}
          <input type="file" hidden accept="image/*" onChange={(e) => onImage(e.target.files[0])} />
        </label>
      </div>

      {extracted && section(L(lang, '图片主色', 'Image colors'), extracted)}
      {section(L(lang, '单色阶（明度）', 'Monochrome scale'), groups.monos)}
      {section(L(lang, '互补色', 'Complementary'), groups.complementary)}
      {section(L(lang, '邻近色', 'Analogous'), groups.analogous)}
      {section(L(lang, '三角色', 'Triadic'), groups.triadic)}

      <div className="tui-field">
        <span className="tui-label">{L(lang, '导出 CSS 变量', 'Export CSS variables')}</span>
        <div className="tui-input-row">
          <input className="tui-input mono" value={exportCss.replace(/\n/g, ' ')} readOnly />
          <CopyButton text={exportCss} small />
        </div>
      </div>
      <div className="tui-field">
        <span className="tui-label">{L(lang, '导出 JSON', 'Export JSON')}</span>
        <div className="tui-input-row">
          <input className="tui-input mono" value={exportColors.join(', ')} readOnly />
          <CopyButton text={exportJson} small />
        </div>
      </div>
    </div>
  );
}
