import React, { useState } from 'react';
import { L, CopyButton, ToolBlock } from './ui';
import { geocode } from '../api/query';
import { useLang } from '../i18n/LanguageContext';

export default function Geocode() {
  const { lang } = useLang();
  const [mode, setMode] = useState('forward');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [lng, setLng] = useState('');
  const [lat, setLat] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forwardList, setForwardList] = useState(null);
  const [reverse, setReverse] = useState(null);

  const mapError = (e) => {
    const map = {
      10001: L(lang, '参数缺失或非法', 'Missing or invalid parameter'),
      10010: L(lang, '服务器繁忙或地图服务未就绪，请稍后再试', 'Server busy or map service not ready, try again later'),
      10402: L(lang, '未查询到结果', 'No result found'),
      10403: L(lang, '解析失败', 'Parsing failed'),
      10404: L(lang, '地图服务调用失败', 'Map service call failed'),
      NETWORK: L(lang, '网络异常，请稍后重试', 'Network error, please try again'),
    };
    return map[e.code] || e.message || L(lang, '查询失败', 'Query failed');
  };

  const runForward = async (e) => {
    e.preventDefault();
    if (!address.trim() || loading) return;
    setLoading(true);
    setError('');
    setForwardList(null);
    try {
      const data = await geocode({ address: address.trim(), city: city.trim() || undefined });
      setForwardList(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(mapError(err));
    } finally {
      setLoading(false);
    }
  };

  const runReverse = async (e) => {
    e.preventDefault();
    if (!lng.trim() || !lat.trim() || loading) return;
    setLoading(true);
    setError('');
    setReverse(null);
    try {
      const data = await geocode({ lng: lng.trim(), lat: lat.trim() });
      setReverse(data);
    } catch (err) {
      setError(mapError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tui">
      <div className="tool-tabs">
        <button type="button" className={`tool-tab ${mode === 'forward' ? 'is-active' : ''}`} onClick={() => { setMode('forward'); setError(''); }}>
          {L(lang, '地址 → 坐标', 'Address → Coords')}
        </button>
        <button type="button" className={`tool-tab ${mode === 'reverse' ? 'is-active' : ''}`} onClick={() => { setMode('reverse'); setError(''); }}>
          {L(lang, '坐标 → 地址', 'Coords → Address')}
        </button>
      </div>

      {mode === 'forward' ? (
        <form className="tui" onSubmit={runForward}>
          <label className="tui-field">
            <span className="tui-label">{L(lang, '地址 / 关键词', 'Address / keyword')}</span>
            <input className="tui-input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={L(lang, '如：北京市朝阳区望京 SOHO', 'e.g. Wangjing SOHO, Beijing')} />
          </label>
          <label className="tui-field tui-field--sm">
            <span className="tui-label">{L(lang, '限定城市（可选）', 'City (optional)')}</span>
            <input className="tui-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder={L(lang, '如：北京', 'e.g. Beijing')} />
          </label>
          <button type="submit" className="btn btn--cta" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            {loading ? L(lang, '查询中…', 'Searching…') : L(lang, '查询', 'Search')}
          </button>
        </form>
      ) : (
        <form className="tui" onSubmit={runReverse}>
          <div className="tui-row">
            <label className="tui-field tui-field--sm">
              <span className="tui-label">{L(lang, '经度 lng', 'Longitude')}</span>
              <input className="tui-input mono" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="116.477795" />
            </label>
            <label className="tui-field tui-field--sm">
              <span className="tui-label">{L(lang, '纬度 lat', 'Latitude')}</span>
              <input className="tui-input mono" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="39.997063" />
            </label>
          </div>
          <button type="submit" className="btn btn--cta" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            {loading ? L(lang, '查询中…', 'Searching…') : L(lang, '查询', 'Search')}
          </button>
          <p className="tui-muted" style={{ fontSize: '0.8rem' }}>{L(lang, '坐标系：gcj02（火星坐标）', 'Coordinate system: gcj02')}</p>
        </form>
      )}

      {error && <div className="tui-error">{error}</div>}

      {mode === 'forward' && forwardList && (
        forwardList.length > 0 ? (
          <div className="tui">
            {forwardList.map((r, i) => (
              <div className="geo-card" key={`${r.lng}-${r.lat}-${i}`}>
                <div className="geo-card__name">{r.name || r.formattedAddress}</div>
                <div className="geo-card__addr">{r.formattedAddress}</div>
                <div className="geo-card__coords">
                  <span className="mono">{r.lng}, {r.lat}</span>
                  <CopyButton text={`${r.lng},${r.lat}`} small />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="tui-muted">{L(lang, '未查询到结果', 'No result found')}</div>
        )
      )}

      {mode === 'reverse' && reverse && (
        <ToolBlock label={L(lang, '解析结果', 'Result')} actions={<CopyButton text={reverse.formattedAddress} small />}>
          <div className="tui-output">{reverse.formattedAddress}</div>
          <div className="tui-stats" style={{ marginTop: 10 }}>
            {[
              { l: L(lang, '省', 'Province'), v: reverse.province },
              { l: L(lang, '市', 'City'), v: reverse.city },
              { l: L(lang, '区/县', 'District'), v: reverse.district },
              { l: L(lang, '街道', 'Township'), v: reverse.township },
            ].filter((x) => x.v).map((x) => (
              <div className="tui-stat" key={x.l}>
                <span className="tui-stat__num" style={{ fontSize: '1rem' }}>{x.v}</span>
                <span className="tui-stat__label">{x.l}</span>
              </div>
            ))}
          </div>
        </ToolBlock>
      )}
    </div>
  );
}
