import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import AuthModal from './AuthModal';

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [mode, setMode] = useState(null); // null | 'login' | 'register'

  const open = useCallback((m = 'login') => setMode(m), []);
  const close = useCallback(() => setMode(null), []);
  const value = useMemo(() => ({ open, close, mode }), [open, close, mode]);

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {mode && (
        <AuthModal
          mode={mode}
          onClose={close}
          onSwitch={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}
          onSuccess={close}
        />
      )}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within an AuthModalProvider');
  return ctx;
}
