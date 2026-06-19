import React, { useState } from 'react';
import { L } from './ui';
import Icon from '../components/Icons';
import { weather } from '../api/query';
import { useLang } from '../i18n/LanguageContext';

export default function Weather() {
  const { lang } = useLang();
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const mapError = (e) => {
    const m = {
      10001: L(lang, '参数无效，请检查城市名', 'Invalid parameter, check the city name'),
      10402: L(lang, '未找到该城市', 'City not found'),
      10405: L(lang, '第三方天气服务调用失败，请稍后再试', 'Weather service failed, try again later'),
      10306: L(lang, '操作过于频繁，请稍后再试', 'Too many requests, try again later'),
      NETWORK: L(lang, '网络异常，请稍后重试', 'Network error, please try again'),
    };
    return m[e.code] || e.message || L(lang, '查询失败', 'Query failed');
  };

  const run = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const d = await weather(city.trim());
      setData(d);
    } catch (err) {
      setError(mapError(err));
    } finally {
      setLoading(false);
    }
  };

  const dash = (v) => (v === null || v === undefined || v === '' ? '—' : v);

  return (
    <div className="tui">
      <form className="tui-row" onSubmit={run}>
        <label className="tui-field" style={{ flex: 1, minWidth: 200 }}>
          <span className="tui-label">{L(lang, '城市（留空按当前 IP 定位）', 'City (blank = locate by your IP)')}</span>
          <input
            className="tui-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={L(lang, '如：北京 / Tokyo', 'e.g. Beijing / Tokyo')}
          />
        </label>
        <button type="submit" className="btn btn--cta" disabled={loading} style={{ alignSelf: 'flex-end' }}>
          {loading ? L(lang, '查询中…', 'Loading…') : L(lang, '查天气', 'Get weather')}
        </button>
      </form>

      {error && <div className="tui-error">{error}</div>}

      {data && (
        <>
          <div className="weather-now">
            <div className="weather-now__main">
              <span className="weather-now__city">
                <Icon name="globe" size={16} />
                {dash(data.city)}
              </span>
              <span className="weather-now__temp">{dash(data.temp)}{data.temp != null && data.temp !== '' ? '°C' : ''}</span>
              <span className="weather-now__cond">{dash(data.weather)}</span>
            </div>
            <div className="weather-now__meta">
              <div>
                <span className="tui-now__label">{L(lang, '湿度', 'Humidity')}</span>
                <span className="tui-now__val">{dash(data.humidity)}{data.humidity != null && data.humidity !== '' ? '%' : ''}</span>
              </div>
              <div>
                <span className="tui-now__label">{L(lang, '风', 'Wind')}</span>
                <span className="tui-now__val">{dash(data.wind)}</span>
              </div>
            </div>
          </div>

          {Array.isArray(data.forecast) && data.forecast.length > 0 && (
            <div className="weather-forecast">
              {data.forecast.map((f, i) => (
                <div className="weather-day" key={f.date || i}>
                  <span className="weather-day__date mono">{dash(f.date)}</span>
                  <span className="weather-day__cond">{dash(f.weather)}</span>
                  <span className="weather-day__temp">
                    <b>{dash(f.high)}°</b> / {dash(f.low)}°
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
