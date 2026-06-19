import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { L, CopyButton, ToolBlock, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

export default function Qrcode({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [mode, setMode] = useState('generate');

  // 生成
  const [text, setText] = useState('https://');
  const [dataUrl, setDataUrl] = useState('');
  const [ecLevel, setEcLevel] = useState('M');
  const [fg, setFg] = useState('#2A211A');
  const [bg, setBg] = useState('#FFFFFF');

  useEffect(() => {
    if (mode !== 'generate' || !text) {
      setDataUrl('');
      return;
    }
    QRCode.toDataURL(text, { width: 320, margin: 2, errorCorrectionLevel: ecLevel, color: { dark: fg, light: bg } })
      .then((url) => {
        setDataUrl(url);
        report();
      })
      .catch(() => setDataUrl(''));
  }, [text, mode, ecLevel, fg, bg, report]);

  // 识别
  const [decoded, setDecoded] = useState('');
  const [decodeErr, setDecodeErr] = useState('');

  const onFile = (file) => {
    setDecoded('');
    setDecodeErr('');
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const res = jsQR(data.data, data.width, data.height);
      if (res && res.data) {
        setDecoded(res.data);
        report();
      } else {
        setDecodeErr(L(lang, '未识别到二维码', 'No QR code found'));
      }
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => setDecodeErr(L(lang, '图片加载失败', 'Failed to load image'));
    img.src = URL.createObjectURL(file);
  };

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'qrcode.png';
    a.click();
  };

  return (
    <div className="tui">
      <div className="tool-tabs">
        <button type="button" className={`tool-tab ${mode === 'generate' ? 'is-active' : ''}`} onClick={() => setMode('generate')}>
          {L(lang, '生成', 'Generate')}
        </button>
        <button type="button" className={`tool-tab ${mode === 'decode' ? 'is-active' : ''}`} onClick={() => setMode('decode')}>
          {L(lang, '识别', 'Decode')}
        </button>
      </div>

      {mode === 'generate' ? (
        <>
          <ToolBlock label={L(lang, '内容', 'Content')}>
            <textarea className="tui-textarea" value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder={L(lang, '网址 / 文本 / 任意内容', 'URL / text / anything')} />
          </ToolBlock>
          <div className="tui-row">
            <label className="tui-field tui-field--sm">
              <span className="tui-label">{L(lang, '纠错级别', 'Error correction')}</span>
              <select className="tui-input" value={ecLevel} onChange={(e) => setEcLevel(e.target.value)}>
                <option value="L">L (7%)</option>
                <option value="M">M (15%)</option>
                <option value="Q">Q (25%)</option>
                <option value="H">H (30%)</option>
              </select>
            </label>
            <label className="tui-field tui-field--sm">
              <span className="tui-label">{L(lang, '前景色', 'Foreground')}</span>
              <input type="color" className="tui-color__picker" value={fg} onChange={(e) => setFg(e.target.value)} />
            </label>
            <label className="tui-field tui-field--sm">
              <span className="tui-label">{L(lang, '背景色', 'Background')}</span>
              <input type="color" className="tui-color__picker" value={bg} onChange={(e) => setBg(e.target.value)} />
            </label>
          </div>
          {dataUrl && (
            <div className="tui-qr">
              <img src={dataUrl} alt="QR code" width={240} height={240} />
              <button type="button" className="btn btn--cta" onClick={download}>
                {L(lang, '下载 PNG', 'Download PNG')}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <label className="pdf-drop">
            <input type="file" hidden accept="image/*" onChange={(e) => onFile(e.target.files[0])} />
            <span className="pdf-drop__hint">{L(lang, '选择含二维码的图片', 'Choose an image with a QR code')}</span>
          </label>
          {decodeErr && <div className="tui-error">{decodeErr}</div>}
          {decoded && (
            <ToolBlock label={L(lang, '识别结果', 'Result')} actions={<CopyButton text={decoded} />}>
              <textarea className="tui-textarea" value={decoded} readOnly rows={3} />
            </ToolBlock>
          )}
        </>
      )}
    </div>
  );
}
