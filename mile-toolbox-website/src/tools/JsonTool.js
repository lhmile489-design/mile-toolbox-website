import React, { useState } from 'react';
import yaml from 'js-yaml';
import { L, CopyButton, ToolBlock, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

function sortKeysDeep(value) {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((acc, k) => {
      acc[k] = sortKeysDeep(value[k]);
      return acc;
    }, {});
  }
  return value;
}

function tsType(value, name, out) {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'any[]';
    return `${tsType(value[0], name, out)}[]`;
  }
  if (typeof value === 'object') {
    const iName = name.charAt(0).toUpperCase() + name.slice(1);
    const lines = Object.keys(value).map((k) => `  ${k}: ${tsType(value[k], k, out)};`);
    out.unshift(`interface ${iName} {\n${lines.join('\n')}\n}`);
    return iName;
  }
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'string';
}

function jsonToTs(obj) {
  const out = [];
  const root = tsType(obj, 'Root', out);
  if (!out.length) return `type Root = ${root};`;
  return out.join('\n\n');
}

export default function JsonTool({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [status, setStatus] = useState(null); // null | {ok, msg}

  const process = (mode) => {
    if (!input.trim()) {
      setStatus({ ok: false, msg: L(lang, '请输入内容', 'Please enter content') });
      setOutput('');
      return;
    }
    try {
      if (mode === 'toYaml') {
        const obj = JSON.parse(input);
        setOutput(yaml.dump(obj, { indent: indent === 0 ? 2 : indent }));
        setStatus({ ok: true, msg: L(lang, '✓ 已转为 YAML', '✓ Converted to YAML') });
        report();
        return;
      }
      if (mode === 'fromYaml') {
        const obj = yaml.load(input);
        const space = indent === 0 ? '\t' : indent;
        setOutput(JSON.stringify(obj, null, space));
        setStatus({ ok: true, msg: L(lang, '✓ 已转为 JSON', '✓ Converted to JSON') });
        report();
        return;
      }
      const obj = JSON.parse(input);
      if (mode === 'format') {
        const space = indent === 0 ? '\t' : indent;
        setOutput(JSON.stringify(obj, null, space));
      } else if (mode === 'minify') {
        setOutput(JSON.stringify(obj));
      } else if (mode === 'sort') {
        const space = indent === 0 ? '\t' : indent;
        setOutput(JSON.stringify(sortKeysDeep(obj), null, space));
        setStatus({ ok: true, msg: L(lang, '✓ 已按键排序', '✓ Keys sorted') });
        report();
        return;
      } else if (mode === 'toTs') {
        setOutput(jsonToTs(obj));
        setStatus({ ok: true, msg: L(lang, '✓ 已生成 TS 接口', '✓ TS interfaces generated') });
        report();
        return;
      } else {
        setOutput('');
      }
      setStatus({ ok: true, msg: L(lang, '✓ 合法 JSON', '✓ Valid JSON') });
      report();
    } catch (e) {
      setOutput('');
      setStatus({ ok: false, msg: `${L(lang, '解析错误', 'Parse error')}: ${e.message}` });
    }
  };

  return (
    <div className="tui">
      <div className="tui-row">
        <button type="button" className="btn btn--cta" onClick={() => process('format')}>
          {L(lang, '格式化', 'Format')}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => process('minify')}>
          {L(lang, '压缩', 'Minify')}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => process('validate')}>
          {L(lang, '校验', 'Validate')}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => process('toYaml')}>
          {L(lang, '转 YAML', 'To YAML')}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => process('fromYaml')}>
          {L(lang, 'YAML 转 JSON', 'YAML to JSON')}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => process('sort')}>
          {L(lang, '排序键', 'Sort keys')}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => process('toTs')}>
          {L(lang, '转 TS 接口', 'To TS')}
        </button>
        <label className="tui-field tui-field--sm">
          <span className="tui-label">{L(lang, '缩进', 'Indent')}</span>
          <select className="tui-input" value={indent} onChange={(e) => setIndent(Number(e.target.value))}>
            <option value={2}>2</option>
            <option value={4}>4</option>
            <option value={0}>Tab</option>
          </select>
        </label>
      </div>

      <ToolBlock label={L(lang, '输入', 'Input')}>
        <textarea className="tui-textarea tui-textarea--mono" value={input} onChange={(e) => setInput(e.target.value)} rows={8} placeholder='{"hello":"world"}' />
      </ToolBlock>

      {status && <div className={`tui-${status.ok ? 'success' : 'error'}`}>{status.msg}</div>}

      {output && (
        <ToolBlock label={L(lang, '输出', 'Output')} actions={<CopyButton text={output} />}>
          <textarea className="tui-textarea tui-textarea--mono" value={output} readOnly rows={8} />
        </ToolBlock>
      )}
    </div>
  );
}
