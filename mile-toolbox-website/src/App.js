import { useEffect, useRef } from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Icon from './components/Icons';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';
import HomePage from './pages/HomePage';
import ToolPage from './pages/ToolPage';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AsyncDemo from './pages/AsyncDemo';
import InstallPrompt from './components/InstallPrompt';
import { CommandPaletteProvider } from './components/CommandPalette';
import { useToolData } from './data/ToolDataContext';
import { useToast } from './components/Toast';
import { useLang } from './i18n/LanguageContext';

function App() {
  const { usingFallback, reload } = useToolData();
  const { t } = useLang();
  const toast = useToast();
  const wasOffline = useRef(false);

  // 在线/离线状态提示
  useEffect(() => {
    const onOffline = () => {
      wasOffline.current = true;
      toast.error(t('common.offline'));
    };
    const onOnline = () => {
      if (wasOffline.current) {
        wasOffline.current = false;
        toast.success(t('common.online'));
      }
    };
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, [toast, t]);

  return (
    <div className="app">
      <CommandPaletteProvider>
        <ScrollToTop />
        <Navbar />
        {usingFallback && (
          <div className="offline-bar" role="status">
            <Icon name="server" size={15} />
            <span>{t('common.offlineNotice')}</span>
            <button type="button" onClick={reload}>
              {t('common.retry')}
            </button>
          </div>
        )}
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tool/:toolKey" element={<ToolPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/async-demo" element={<AsyncDemo />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <BackToTop />
        <InstallPrompt />
      </CommandPaletteProvider>
    </div>
  );
}

export default App;
