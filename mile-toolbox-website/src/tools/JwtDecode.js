import React, { useMemo, useState } from 'react';
import { L, CopyButton, ToolBlock, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

function b64urlDecode(str) {
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4;
  if (pad) s += '='.repeat(4 - pad);
  return decodeURIComponent(escape(atob(s)));
}

function fmtTime(sec) {
  try {
    return new Date(sec * 1000).toLocaleString();
  } catch (e) {
    return String(sec);
  }
}

export default function JwtDecode({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [token, setToken] = useState('');

  const parsed = useMemo(() => {
    const t = token.trim();
    if (!t) return null;
    const parts = t.split('.');
    if (parts.length < 2) return { error: L(lang, '不是有效的 JWT（应为 3 段，以 . 分隔）', 'Not a valid JWT (expects 3 dot-separated parts)') };
    try {
      const header = JSON.parse(b64urlDecode(parts[0]));
      const payload = JSON.parse(b64urlDecode(parts[1]));
      report();
      return { header, payload };
    } catch (e) {
      return { error: L(lang, '解析失败：Base64Url 或 JSON 格式有误', 'Decode failed: invalid Base64Url or JSON') };
    }
  }, [token, lang, report]);

  const payload = parsed && parsed.payload;
  const now = Math.floor(Date.now() / 1000);
  const expired = payload && payload.exp && payload.exp < now;

  return (
    <div className="tui">
      <ToolBlock label={L(lang, 'JWT', 'JWT')}>
        <textarea className="tui-textarea tui-textarea--mono" value={token} onChange={(e) => setToken(e.target.value)} rows={4} placeholder="eyJhbGci....eyJzdWIi....SflKxw..." />
      </ToolBlock>

      {parsed && parsed.error && <div className="tui-error">{parsed.error}</div>}

      {parsed && parsed.header && (
        <>
          <ToolBlock label={L(lang, 'Header', 'Header')} actions={<CopyButton text={JSON.stringify(parsed.header, null, 2)} small />}>
            <textarea className="tui-textarea tui-textarea--mono" value={JSON.stringify(parsed.header, null, 2)} readOnly rows={3} />
          </ToolBlock>
          <ToolBlock label={L(lang, 'Payload', 'Payload')} actions={<CopyButton text={JSON.stringify(payload, null, 2)} small />}>
            <textarea className="tui-textarea tui-textarea--mono" value={JSON.stringify(payload, null, 2)} readOnly rows={6} />
          </ToolBlock>

          {(payload.iat || payload.exp || payload.nbf) && (
            <div className="tui-stats">
              {payload.iat && (
                <div className="tui-stat"><span className="tui-stat__num" style={{ fontSize: '0.95rem' }}>{fmtTime(payload.iat)}</span><span className="tui-stat__label">{L(lang, '签发 iat', 'Issued iat')}</span></div>
              )}
              {payload.nbf && (
                <div className="tui-stat"><span className="tui-stat__num" style={{ fontSize: '0.95rem' }}>{fmtTime(payload.nbf)}</span><span className="tui-stat__label">{L(lang, '生效 nbf', 'Not before')}</span></div>
              )}
              {payload.exp && (
                <div className="tui-stat" style={expired ? { borderColor: '#f6c9cb' } : undefined}>
                  <span className="tui-stat__num" style={{ fontSize: '0.95rem', color: expired ? '#c62a2f' : undefined }}>{fmtTime(payload.exp)}</span>
                  <span className="tui-stat__label">{expired ? L(lang, '已过期 exp', 'Expired exp') : L(lang, '过期 exp', 'Expires exp')}</span>
                </div>
              )}
            </div>
          )}
          <p className="tui-muted" style={{ fontSize: '0.8rem' }}>{L(lang, '仅解码展示，未校验签名（需密钥，本地不做）。', 'Decode only — signature not verified (needs the secret).')}</p>
        </>
      )}
    </div>
  );
}
