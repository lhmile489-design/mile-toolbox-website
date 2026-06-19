import React, { useState } from 'react';
import { L, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

function fmtSize(n) {
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

export default function ImageCompress({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [src, setSrc] = useState(null); // {url, size, w, h, name}
  const [quality, setQuality] = useState(0.8);
  const [maxW, setMaxW] = useState('');
  const [format, setFormat] = useState('image/jpeg');
  const [out, setOut] = useState(null);
  const [busy, setBusy] = useState(false);

  const onFile = (file) => {
    setOut(null);
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setSrc({ url, size: file.size, w: img.naturalWidth, h: img.naturalHeight, name: file.name, img });
    img.src = url;
  };

  const compress = () => {
    if (!src) return;
    setBusy(true);
    const scale = maxW && Number(maxW) > 0 && Number(maxW) < src.w ? Number(maxW) / src.w : 1;
    const w = Math.round(src.w * scale);
    const h = Math.round(src.h * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (format === 'image/jpeg') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(src.img, 0, 0, w, h);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setOut({ url: URL.createObjectURL(blob), size: blob.size, w, h });
          report();
        }
        setBusy(false);
      },
      format,
      quality
    );
  };

  const download = () => {
    if (!out) return;
    const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
    const a = document.createElement('a');
    a.href = out.url;
    a.download = `compressed.${ext}`;
    a.click();
  };

  const ratio = src && out ? Math.round((1 - out.size / src.size) * 100) : 0;

  return (
    <div className="tui">
      <label className="pdf-drop">
        <input type="file" hidden accept="image/*" onChange={(e) => onFile(e.target.files[0])} />
        <span className="pdf-drop__hint">{L(lang, '选择图片（本地压缩，不上传）', 'Choose an image (compressed locally, no upload)')}</span>
      </label>

      {src && (
        <>
          <div className="tui-row">
            <label className="tui-field">
              <span className="tui-label">{L(lang, '质量', 'Quality')}: <b className="mono">{quality.toFixed(2)}</b></span>
              <input type="range" min={0.1} max={1} step={0.05} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="tui-range" />
            </label>
            <label className="tui-field tui-field--sm">
              <span className="tui-label">{L(lang, '最大宽度(px)', 'Max width (px)')}</span>
              <input className="tui-input mono" value={maxW} onChange={(e) => setMaxW(e.target.value)} placeholder={`${src.w}`} />
            </label>
            <label className="tui-field tui-field--sm">
              <span className="tui-label">{L(lang, '格式', 'Format')}</span>
              <select className="tui-input" value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="image/jpeg">JPEG</option>
                <option value="image/webp">WebP</option>
                <option value="image/png">PNG</option>
              </select>
            </label>
            <button type="button" className="btn btn--cta" onClick={compress} disabled={busy}>
              {busy ? L(lang, '处理中…', 'Processing…') : L(lang, '压缩', 'Compress')}
            </button>
          </div>

          <div className="img-compare">
            <div className="img-compare__col">
              <img src={src.url} alt="source" />
              <span className="tui-stat__label">{L(lang, '原图', 'Original')} · {fmtSize(src.size)} · {src.w}×{src.h}</span>
            </div>
            {out && (
              <div className="img-compare__col">
                <img src={out.url} alt="result" />
                <span className="tui-stat__label">
                  {L(lang, '压缩后', 'Result')} · {fmtSize(out.size)} · {out.w}×{out.h}
                  {ratio > 0 && <b style={{ color: '#1c7a47' }}> (-{ratio}%)</b>}
                </span>
              </div>
            )}
          </div>

          {out && (
            <button type="button" className="btn btn--cta" onClick={download} style={{ alignSelf: 'flex-start' }}>
              {L(lang, '下载', 'Download')}
            </button>
          )}
        </>
      )}
    </div>
  );
}
