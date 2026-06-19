import React, { useMemo, useState } from 'react';
import MarkdownIt from 'markdown-it';
import { L, CopyButton, useReportOnce } from './ui';
import { useLang } from '../i18n/LanguageContext';

const md = new MarkdownIt({ html: false, linkify: true, breaks: true, typographer: true });

const SAMPLE = `# 标题 Heading\n\n- 列表项 item\n- **加粗** *斜体*\n\n\`\`\`js\nconst a = 1;\n\`\`\`\n\n> 引用 quote\n\n[链接 link](https://example.com)`;

export default function Markdown({ tool }) {
  const { lang } = useLang();
  const report = useReportOnce(tool.toolKey);
  const [text, setText] = useState(SAMPLE);

  const html = useMemo(() => md.render(text || ''), [text]);

  const onInput = (v) => {
    setText(v);
    if (v) report();
  };

  return (
    <div className="tui">
      <div className="md-split">
        <div className="md-pane">
          <div className="tui-block__head">
            <span className="tui-block__label">Markdown</span>
            <CopyButton text={text} small />
          </div>
          <textarea className="tui-textarea tui-textarea--mono" value={text} onChange={(e) => onInput(e.target.value)} rows={16} />
        </div>
        <div className="md-pane">
          <span className="tui-block__label">{L(lang, '预览', 'Preview')}</span>
          {/* markdown-it html:false 已禁用原始 HTML，避免 XSS */}
          <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
}
