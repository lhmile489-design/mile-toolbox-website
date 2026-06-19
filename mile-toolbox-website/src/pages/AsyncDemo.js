import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons';
import AsyncTaskRunner from '../components/AsyncTaskRunner';
import { submitAsyncEcho } from '../api/asyncTask';
import { L } from '../tools/ui';
import { useLang } from '../i18n/LanguageContext';

/**
 * 异步任务框架联调页（未在导航中暴露，仅供验证 §9 的提交→轮询→下载链路）。
 * 后端演示端点 /file/async/echo 未登记 toolKey，故不进工具中心。
 * 真实耗时工具接入时：登记 toolKey + 用 AsyncTaskRunner 传入对应 submitFn 即可。
 */
export default function AsyncDemo() {
  const { lang } = useLang();
  return (
    <section className="tool-page">
      <div className="container">
        <div className="tool-page__crumb">
          <Link to="/" className="tool-page__back">
            <Icon name="arrow" size={16} className="tool-page__back-icon" />
            {L(lang, '返回首页', 'Back to home')}
          </Link>
        </div>

        <header className="tool-page__head">
          <span className="tool-page__icon" aria-hidden="true">
            <Icon name="server" size={26} />
          </span>
          <div className="tool-page__head-text">
            <h1 className="tool-page__title">{L(lang, '异步任务框架 · 联调演示', 'Async Task Framework · Demo')}</h1>
            <p className="tool-page__desc">
              {L(
                lang,
                '上传任意文件，验证「提交 → 轮询进度 → 下载产物」链路（演示端点原样回显）。',
                'Upload any file to verify submit → poll progress → download (echo demo endpoint).'
              )}
            </p>
          </div>
        </header>

        <div className="tool-page__body">
          <AsyncTaskRunner submitFn={submitAsyncEcho} />
        </div>
      </div>
    </section>
  );
}
