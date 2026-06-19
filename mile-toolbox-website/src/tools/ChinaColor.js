import React, { useMemo, useState } from 'react';
import { L, ColorSwatch, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

// 部分中国传统色（名称 + 拼音 + HEX）
const COLORS = [
  { name: '胭脂', py: 'yānzhī', hex: '#9D2933' },
  { name: '朱砂', py: 'zhūshā', hex: '#FF461F' },
  { name: '银朱', py: 'yínzhū', hex: '#E94829' },
  { name: '丹', py: 'dān', hex: '#FF4E20' },
  { name: '彤', py: 'tóng', hex: '#F35336' },
  { name: '茜色', py: 'qiànsè', hex: '#CB3A56' },
  { name: '海棠红', py: 'hǎitánghóng', hex: '#DB5A6B' },
  { name: '酡红', py: 'tuóhóng', hex: '#DC3023' },
  { name: '妃色', py: 'fēisè', hex: '#ED5736' },
  { name: '橘黄', py: 'júhuáng', hex: '#FF8936' },
  { name: '杏黄', py: 'xìnghuáng', hex: '#FFA631' },
  { name: '橙黄', py: 'chénghuáng', hex: '#FFA400' },
  { name: '鹅黄', py: 'éhuáng', hex: '#FFF143' },
  { name: '缃色', py: 'xiāngsè', hex: '#F0C239' },
  { name: '雌黄', py: 'cíhuáng', hex: '#FFC64B' },
  { name: '金', py: 'jīn', hex: '#EACD76' },
  { name: '柳黄', py: 'liǔhuáng', hex: '#C9DD22' },
  { name: '葱黄', py: 'cōnghuáng', hex: '#A3D900' },
  { name: '豆绿', py: 'dòulǜ', hex: '#9ED900' },
  { name: '葱绿', py: 'cōnglǜ', hex: '#9ED048' },
  { name: '竹青', py: 'zhúqīng', hex: '#789262' },
  { name: '松花绿', py: 'sōnghuālǜ', hex: '#057748' },
  { name: '青翠', py: 'qīngcuì', hex: '#00E079' },
  { name: '碧色', py: 'bìsè', hex: '#1BD1A5' },
  { name: '石绿', py: 'shílǜ', hex: '#16A951' },
  { name: '缥碧', py: 'piāobì', hex: '#48C0A3' },
  { name: '湖蓝', py: 'húlán', hex: '#30DFF3' },
  { name: '蔚蓝', py: 'wèilán', hex: '#70F3FF' },
  { name: '靛青', py: 'diànqīng', hex: '#177CB0' },
  { name: '群青', py: 'qúnqīng', hex: '#4B5CC4' },
  { name: '宝蓝', py: 'bǎolán', hex: '#4B5CC4' },
  { name: '藏蓝', py: 'zànglán', hex: '#3B2E7E' },
  { name: '黛', py: 'dài', hex: '#4A4266' },
  { name: '紫酱', py: 'zǐjiàng', hex: '#815463' },
  { name: '丁香色', py: 'dīngxiāngsè', hex: '#CCA4E3' },
  { name: '雪青', py: 'xuěqīng', hex: '#B0A4E3' },
  { name: '黝黑', py: 'yǒuhēi', hex: '#3D3B4F' },
  { name: '墨色', py: 'mòsè', hex: '#50616D' },
  { name: '缟', py: 'gǎo', hex: '#F2ECDE' },
  { name: '月白', py: 'yuèbái', hex: '#D6ECF0' },
];

export default function ChinaColor({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [kw, setKw] = useState('');

  const list = useMemo(() => {
    const q = kw.trim().toLowerCase();
    if (!q) return COLORS;
    return COLORS.filter((c) => c.name.includes(q) || c.py.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q));
  }, [kw]);

  return (
    <div className="tui">
      <input
        className="tui-input"
        value={kw}
        onChange={(e) => { setKw(e.target.value); report(); }}
        placeholder={L(lang, '搜索：名称 / 拼音 / HEX', 'Search: name / pinyin / HEX')}
      />
      <p className="tui-muted" style={{ fontSize: '0.82rem' }}>{L(lang, '点击色卡复制 HEX', 'Click a swatch to copy its HEX')}</p>
      <div className="swatch-grid swatch-grid--named">
        {list.map((c) => (
          <ColorSwatch key={c.hex + c.name} color={c.hex} name={lang === 'en' ? c.py : c.name} />
        ))}
      </div>
    </div>
  );
}
