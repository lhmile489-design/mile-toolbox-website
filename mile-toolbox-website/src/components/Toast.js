import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Icon from './Icons';

const ToastContext = createContext(null);

let seq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const show = useCallback(
    (message, type = 'info', duration = 3200) => {
      if (!message) return;
      seq += 1;
      const id = seq;
      setToasts((list) => [...list, { id, message, type }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      show,
      success: (m, d) => show(m, 'success', d),
      error: (m, d) => show(m, 'error', d),
      info: (m, d) => show(m, 'info', d),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <Icon name={t.type === 'success' ? 'check' : t.type === 'error' ? 'shield' : 'bolt'} size={16} />
            <span>{t.message}</span>
            <button type="button" className="toast__close" onClick={() => dismiss(t.id)} aria-label="close">
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
