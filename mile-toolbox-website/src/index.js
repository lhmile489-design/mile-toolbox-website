import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider } from './theme/ThemeContext';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './auth/AuthContext';
import { ToolDataProvider } from './data/ToolDataContext';
import { AuthModalProvider } from './components/AuthModalProvider';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <ToolDataProvider>
              <BrowserRouter>
                <AuthModalProvider>
                  <App />
                </AuthModalProvider>
              </BrowserRouter>
            </ToolDataProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// PWA：仅生产环境注册 Service Worker（离线 + 可安装）
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${process.env.PUBLIC_URL}/service-worker.js`).catch(() => {});
  });
}
