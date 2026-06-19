import React, { useState } from 'react';
import { L, ToolBlock, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

const WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const CHECK = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
const PROVINCES = {
  11: ['北京', 'Beijing'], 12: ['天津', 'Tianjin'], 13: ['河北', 'Hebei'], 14: ['山西', 'Shanxi'],
  15: ['内蒙古', 'Inner Mongolia'], 21: ['辽宁', 'Liaoning'], 22: ['吉林', 'Jilin'], 23: ['黑龙江', 'Heilongjiang'],
  31: ['上海', 'Shanghai'], 32: ['江苏', 'Jiangsu'], 33: ['浙江', 'Zhejiang'], 34: ['安徽', 'Anhui'],
  35: ['福建', 'Fujian'], 36: ['江西', 'Jiangxi'], 37: ['山东', 'Shandong'], 41: ['河南', 'Henan'],
  42: ['湖北', 'Hubei'], 43: ['湖南', 'Hunan'], 44: ['广东', 'Guangdong'], 45: ['广西', 'Guangxi'],
  46: ['海南', 'Hainan'], 50: ['重庆', 'Chongqing'], 51: ['四川', 'Sichuan'], 52: ['贵州', 'Guizhou'],
  53: ['云南', 'Yunnan'], 54: ['西藏', 'Tibet'], 61: ['陕西', 'Shaanxi'], 62: ['甘肃', 'Gansu'],
  63: ['青海', 'Qinghai'], 64: ['宁夏', 'Ningxia'], 65: ['新疆', 'Xinjiang'],
};
const ZODIAC = [['鼠', 'Rat'], ['牛', 'Ox'], ['虎', 'Tiger'], ['兔', 'Rabbit'], ['龙', 'Dragon'], ['蛇', 'Snake'], ['马', 'Horse'], ['羊', 'Goat'], ['猴', 'Monkey'], ['鸡', 'Rooster'], ['狗', 'Dog'], ['猪', 'Pig']];
const CONST_DATES = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];
const CONST = [['摩羯', 'Capricorn'], ['水瓶', 'Aquarius'], ['双鱼', 'Pisces'], ['白羊', 'Aries'], ['金牛', 'Taurus'], ['双子', 'Gemini'], ['巨蟹', 'Cancer'], ['狮子', 'Leo'], ['处女', 'Virgo'], ['天秤', 'Libra'], ['天蝎', 'Scorpio'], ['射手', 'Sagittarius'], ['摩羯', 'Capricorn']];

const ri = (n) => Math.floor(Math.random() * n);

function validate(id) {
  const v = id.trim().toUpperCase();
  if (!/^\d{17}[\dX]$/.test(v)) return { ok: false, reason: 'format' };
  let sum = 0;
  for (let i = 0; i < 17; i += 1) sum += parseInt(v[i], 10) * WEIGHTS[i];
  if (CHECK[sum % 11] !== v[17]) return { ok: false, reason: 'checksum' };
  const y = +v.slice(6, 10);
  const m = +v.slice(10, 12);
  const d = +v.slice(12, 14);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return { ok: false, reason: 'birth' };
  let age = new Date().getFullYear() - y;
  const now = new Date();
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age -= 1;
  const constIdx = d < CONST_DATES[m - 1] ? m - 1 : m;
  return {
    ok: true,
    province: PROVINCES[+v.slice(0, 2)],
    birthday: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    age,
    male: parseInt(v[16], 10) % 2 === 1,
    zodiac: ZODIAC[(y - 1900) % 12],
    constellation: CONST[constIdx],
  };
}

function genId() {
  const provs = Object.keys(PROVINCES);
  const region = provs[ri(provs.length)] + String(ri(99) + 1).padStart(2, '0') + String(ri(99) + 1).padStart(2, '0');
  const y = 1965 + ri(45);
  const m = 1 + ri(12);
  const d = 1 + ri(28);
  const birth = `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
  const seq = String(ri(900) + 100);
  const body = region + birth + seq;
  let sum = 0;
  for (let i = 0; i < 17; i += 1) sum += parseInt(body[i], 10) * WEIGHTS[i];
  return body + CHECK[sum % 11];
}

export default function Idcard({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [id, setId] = useState('');
  const [res, setRes] = useState(null);
  const i = lang === 'en' ? 1 : 0;

  const onInput = (v) => {
    setId(v);
    if (!v.trim()) {
      setRes(null);
      return;
    }
    const r = validate(v);
    setRes(r);
    if (r.ok) report();
  };

  const reasonText = {
    format: L(lang, '格式错误：应为 18 位（末位可为 X）', 'Invalid format: must be 18 chars (last may be X)'),
    checksum: L(lang, '校验码错误，身份证号不合法', 'Checksum failed: invalid ID number'),
    birth: L(lang, '出生日期无效', 'Invalid birth date'),
  };

  return (
    <div className="tui">
      <ToolBlock label={L(lang, '身份证号', 'ID number')} actions={
        <button type="button" className="tui-copy tui-copy--sm" onClick={() => onInput(genId())}>
          {L(lang, '生成测试号', 'Generate test ID')}
        </button>
      }>
        <input className="tui-input mono" value={id} onChange={(e) => onInput(e.target.value)} maxLength={18} placeholder="11010119900307xxxx" aria-invalid={res && !res.ok} />
      </ToolBlock>

      {res && !res.ok && <div className="tui-error">{reasonText[res.reason]}</div>}

      {res && res.ok && (
        <>
          <div className="tui-success">{L(lang, '✓ 身份证号合法', '✓ Valid ID number')}</div>
          <div className="tui-stats">
            <div className="tui-stat">
              <span className="tui-stat__num" style={{ fontSize: '1.1rem' }}>{res.province ? res.province[i] : '—'}</span>
              <span className="tui-stat__label">{L(lang, '归属省份', 'Province')}</span>
            </div>
            <div className="tui-stat">
              <span className="tui-stat__num mono" style={{ fontSize: '1.05rem' }}>{res.birthday}</span>
              <span className="tui-stat__label">{L(lang, '出生日期', 'Birthday')}</span>
            </div>
            <div className="tui-stat">
              <span className="tui-stat__num mono">{res.age}</span>
              <span className="tui-stat__label">{L(lang, '年龄', 'Age')}</span>
            </div>
            <div className="tui-stat">
              <span className="tui-stat__num" style={{ fontSize: '1.1rem' }}>{res.male ? L(lang, '男', 'Male') : L(lang, '女', 'Female')}</span>
              <span className="tui-stat__label">{L(lang, '性别', 'Sex')}</span>
            </div>
            <div className="tui-stat">
              <span className="tui-stat__num" style={{ fontSize: '1.1rem' }}>{res.zodiac[i]}</span>
              <span className="tui-stat__label">{L(lang, '生肖', 'Zodiac')}</span>
            </div>
            <div className="tui-stat">
              <span className="tui-stat__num" style={{ fontSize: '1.1rem' }}>{res.constellation[i]}</span>
              <span className="tui-stat__label">{L(lang, '星座', 'Constellation')}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
