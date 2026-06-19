import React, { useState } from 'react';
import { L, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

const POSITIONS = ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'center'];

export default function ImageEdit({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [src, setSrc] = useState(null);
  const [scale, setScale] = useState(100);
  const [rotate, setRotate] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [wmText, setWmText] = useState('');
  const [wmPos, setWmPos] = useState('bottom-right');
  const [out, setOut] = useState(null);
  const [busy, setBusy] = useState(false);

  const onFile = (file) => {
    setOut(null);
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setSrc({ url, w: img.naturalWidth, h: img.naturalHeight, img });
    img.src = url;
  };

  const apply = () => {
    if (!src) return;
    setBusy(true);
    const sw = Math.max(1, Math.round((src.w * scale) / 100));
    const sh = Math.max(1, Math.round((src.h * scale) / 100));
    const swap = rotate === 90 || rotate === 270;
    const canvas = document.createElement('canvas');
    canvas.width = swap ? sh : sw;
    canvas.height = swap ? sw : sh;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(src.img, -sw / 2, -sh / 2, sw, sh);
    ctx.restore();

    if (wmText.trim()) {
      const w = canvas.width;
      const h = canvas.height;
      const fontSize = Math.max(14, Math.round(w / 22));
      ctx.font = `600 ${fontSize}px sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = Math.max(1, fontSize / 12);
      const m = ctx.measureText(wmText);
      const pad = fontSize * 0.6;
      let x = w - m.width - pad;
      let y = h - pad;
      ctx.textBaseline = 'alphabetic';
      if (wmPos === 'bottom-left') { x = pad; y = h - pad; }
      else if (wmPos === 'top-right') { x = w - m.width - pad; y = fontSize + pad; }
      else if (wmPos === 'top-left') { x = pad; y = fontSize + pad; }
      else if (wmPos === 'center') { x = (w - m.width) / 2; y = h / 2; }
      ctx.strokeText(wmText, x, y);
      ctx.fillText(wmText, x, y);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        setOut({ url: URL.createObjectURL(blob), w: canvas.width, h: canvas.height });
        report();
      }
      setBusy(false);
    }, 'image/png');
  };

  const download = () => {
    if (!out) return;
    const a = document.createElement('a');
    a.href = out.url;
    a.download = 'edited.png';
    a.click();
  };

  return (
    <div className="tui">
      <label className="pdf-drop">
        <input type="file" hidden accept="image/*" onChange={(e) => onFile(e.target.files[0])} />
        <span className="pdf-drop__hint">{L(lang, '选择图片（本地处理，不上传）', 'Choose an image (processed locally, no upload)')}</span>
      </label>

      {src && (
        <>
          <label className="tui-field">
            <span className="tui-label">{L(lang, '缩放', 'Scale')}: <b className="mono">{scale}%</b> → {Math.round((src.w * scale) / 100)}×{Math.round((src.h * scale) / 100)}</span>
            <input type="range" min={10} max={200} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="tui-range" />
          </label>

          <div className="tui-row">
            <label className="tui-field tui-field--sm">
              <span className="tui-label">{L(lang, '旋转', 'Rotate')}</span>
              <select className="tui-input" value={rotate} onChange={(e) => setRotate(Number(e.target.value))}>
                <option value={0}>0°</option>
                <option value={90}>90°</option>
                <option value={180}>180°</option>
                <option value={270}>270°</option>
              </select>
            </label>
            <label className="tui-check">
              <input type="checkbox" checked={flipH} onChange={(e) => setFlipH(e.target.checked)} />
              {L(lang, '水平翻转', 'Flip H')}
            </label>
            <label className="tui-check">
              <input type="checkbox" checked={flipV} onChange={(e) => setFlipV(e.target.checked)} />
              {L(lang, '垂直翻转', 'Flip V')}
            </label>
          </div>

          <div className="tui-row">
            <label className="tui-field" style={{ flex: 1, minWidth: 180 }}>
              <span className="tui-label">{L(lang, '水印文字（可选）', 'Watermark text (optional)')}</span>
              <input className="tui-input" value={wmText} onChange={(e) => setWmText(e.target.value)} placeholder="© Mile" />
            </label>
            <label className="tui-field tui-field--sm">
              <span className="tui-label">{L(lang, '位置', 'Position')}</span>
              <select className="tui-input" value={wmPos} onChange={(e) => setWmPos(e.target.value)}>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
            <button type="button" className="btn btn--cta" onClick={apply} disabled={busy}>
              {busy ? L(lang, '处理中…', 'Processing…') : L(lang, '应用', 'Apply')}
            </button>
          </div>

          <div className="img-compare">
            <div className="img-compare__col">
              <img src={out ? out.url : src.url} alt="preview" />
              <span className="tui-stat__label">{out ? `${L(lang, '结果', 'Result')} · ${out.w}×${out.h}` : `${L(lang, '原图', 'Original')} · ${src.w}×${src.h}`}</span>
            </div>
          </div>

          {out && (
            <button type="button" className="btn btn--cta" onClick={download} style={{ alignSelf: 'flex-start' }}>
              {L(lang, '下载 PNG', 'Download PNG')}
            </button>
          )}
        </>
      )}
    </div>
  );
}
