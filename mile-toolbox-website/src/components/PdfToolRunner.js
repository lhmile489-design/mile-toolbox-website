import React, { useMemo, useState } from 'react';
import Icon from './Icons';
import { PDF_TOOLS } from '../data/pdfTools';
import { postFileProcess, downloadBlob } from '../api/pdf';
import { CopyButton } from '../tools/ui';
import { useLang } from '../i18n/LanguageContext';

function initialValues(op) {
  const v = {};
  op.fields.forEach((f) => {
    if (f.type === 'files') v[f.name] = [];
    else if (f.type === 'file') v[f.name] = null;
    else if (f.type === 'select') v[f.name] = f.def != null ? f.def : (f.options && f.options[0] ? f.options[0].value : '');
    else if (f.type === 'number') v[f.name] = f.def != null ? String(f.def) : '';
    else v[f.name] = '';
  });
  return v;
}

export default function PdfToolRunner({ tool }) {
  const { t } = useLang();
  const config = PDF_TOOLS[tool.toolKey];
  const operations = config.operations;
  const [opKey, setOpKey] = useState(operations[0].key);
  const op = useMemo(() => operations.find((o) => o.key === opKey) || operations[0], [operations, opKey]);

  const [values, setValues] = useState(() => initialValues(operations[0]));
  const [status, setStatus] = useState('idle'); // idle | processing | success | error
  const [message, setMessage] = useState('');
  const [saveToCloud, setSaveToCloud] = useState(false);
  const [cloudResult, setCloudResult] = useState(null); // { url, filename, size }

  const switchOp = (key) => {
    setOpKey(key);
    const next = operations.find((o) => o.key === key);
    setValues(initialValues(next));
    setStatus('idle');
    setMessage('');
    setCloudResult(null);
  };

  const setField = (name, val) => {
    setValues((v) => ({ ...v, [name]: val }));
    if (status !== 'processing') {
      setStatus('idle');
      setMessage('');
      setCloudResult(null);
    }
  };

  const validate = () => {
    for (const f of op.fields) {
      const val = values[f.name];
      if (f.type === 'file') {
        if (f.required && !val) return t('pdf.errors.required');
      } else if (f.type === 'files') {
        const arr = val || [];
        if (f.required && arr.length === 0) return t('pdf.errors.required');
        if (f.min && arr.length > 0 && arr.length < f.min) return t('pdf.errors.fileMin', { n: f.min });
        if (f.max && arr.length > f.max) return t('pdf.errors.fileMax', { n: f.max });
      } else if (f.type !== 'number') {
        if (f.required && !String(val || '').trim()) return t('pdf.errors.required');
      }
    }
    return null;
  };

  const buildFormData = () => {
    const fd = new FormData();
    op.fields.forEach((f) => {
      const val = values[f.name];
      if (f.type === 'file') {
        if (val) fd.append(f.name, val);
      } else if (f.type === 'files') {
        (val || []).forEach((file) => fd.append(f.name, file));
      } else if (f.type === 'number') {
        fd.append(f.name, String(val || f.def || ''));
      } else {
        fd.append(f.name, String(val || '').trim());
      }
    });
    if (saveToCloud) fd.append('save', 'true');
    return fd;
  };

  const mapError = (e) => {
    if (e && e.code === 'NETWORK') return t('pdf.errors.network');
    const byCode = e && e.code != null ? t(`pdf.errors.${e.code}`) : null;
    return typeof byCode === 'string' ? byCode : (e && e.message) || t('pdf.errors.generic');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (status === 'processing') return;
    const err = validate();
    if (err) {
      setStatus('error');
      setMessage(err);
      return;
    }
    setStatus('processing');
    setMessage('');
    setCloudResult(null);
    try {
      const result = await postFileProcess(op.endpoint, buildFormData());
      if (result.kind === 'url') {
        setCloudResult({ url: result.url, filename: result.filename || op.download, size: result.size });
        setStatus('success');
        setMessage(t('pdf.savedToCloud'));
      } else {
        downloadBlob(result.blob, result.filename || op.download);
        setStatus('success');
        setMessage(t('pdf.successHint'));
      }
    } catch (err2) {
      setStatus('error');
      setMessage(mapError(err2));
    }
  };

  const renderField = (f) => {
    if (f.type === 'file' || f.type === 'files') {
      const multiple = f.type === 'files';
      const selected = multiple ? values[f.name] || [] : values[f.name];
      const hasSel = multiple ? selected.length > 0 : !!selected;
      return (
        <div className="pdf-field" key={f.name}>
          <label className="pdf-drop">
            <input
              type="file"
              hidden
              accept={f.accept}
              multiple={multiple}
              onChange={(e) => setField(f.name, multiple ? Array.from(e.target.files) : e.target.files[0] || null)}
            />
            <Icon name="file" size={22} />
            <span className="pdf-drop__hint">
              {multiple ? t('pdf.chooseFiles') : t('pdf.chooseFile')}
            </span>
          </label>
          {hasSel && (
            <div className="pdf-files">
              {multiple ? (
                <>
                  <span className="pdf-files__count mono">{t('pdf.selectedN', { n: selected.length })}</span>
                  <ul>
                    {selected.map((file, i) => (
                      <li key={`${file.name}-${i}`}>{file.name}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <span className="pdf-files__one">{selected.name}</span>
              )}
              <button type="button" className="pdf-files__clear" onClick={() => setField(f.name, multiple ? [] : null)}>
                {t('pdf.clear')}
              </button>
            </div>
          )}
        </div>
      );
    }

    if (f.type === 'number') {
      return (
        <label className="pdf-field" key={f.name}>
          <span className="pdf-field__label">{t(`pdf.fields.${f.labelKey}`)}</span>
          <input
            type="number"
            min={f.min}
            max={f.max}
            step={f.step}
            value={values[f.name]}
            onChange={(e) => setField(f.name, e.target.value)}
          />
        </label>
      );
    }

    if (f.type === 'select') {
      return (
        <label className="pdf-field" key={f.name}>
          <span className="pdf-field__label">{t(`pdf.fields.${f.labelKey}`)}</span>
          <select value={values[f.name]} onChange={(e) => setField(f.name, e.target.value)}>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      );
    }

    return (
      <label className="pdf-field" key={f.name}>
        <span className="pdf-field__label">{t(`pdf.fields.${f.labelKey}`)}</span>
        <input
          type={f.type === 'password' ? 'password' : 'text'}
          value={values[f.name]}
          placeholder={f.placeholderKey ? t(`pdf.fields.${f.placeholderKey}`) : ''}
          onChange={(e) => setField(f.name, e.target.value)}
        />
      </label>
    );
  };

  return (
    <div className="pdf-runner">
      {operations.length > 1 && (
        <div className="pdf-tabs" role="tablist">
          {operations.map((o) => (
            <button
              key={o.key}
              type="button"
              role="tab"
              aria-selected={o.key === opKey}
              className={`pdf-tab ${o.key === opKey ? 'is-active' : ''}`}
              onClick={() => switchOp(o.key)}
            >
              {t(`pdf.ops.${o.key}`)}
            </button>
          ))}
        </div>
      )}

      <form className="pdf-form" onSubmit={submit}>
        {op.fields.map(renderField)}

        <label className="tui-check">
          <input type="checkbox" checked={saveToCloud} onChange={(e) => setSaveToCloud(e.target.checked)} />
          {t('pdf.saveToCloud')}
        </label>

        {message && (
          <div className={`pdf-msg ${status === 'success' ? 'is-success' : 'is-error'}`} role="alert">
            <Icon name={status === 'success' ? 'check' : 'shield'} size={15} />
            {message}
          </div>
        )}

        {cloudResult && cloudResult.url && (
          <div className="pdf-cloud">
            <a className="pdf-cloud__link" href={cloudResult.url} target="_blank" rel="noopener noreferrer">
              <Icon name="server" size={15} />
              <span>{cloudResult.filename}</span>
            </a>
            <CopyButton text={cloudResult.url} small />
          </div>
        )}

        <button type="submit" className="btn btn--cta pdf-submit" disabled={status === 'processing'}>
          {status === 'processing' ? t('pdf.processing') : t('pdf.run')}
        </button>
      </form>
    </div>
  );
}
