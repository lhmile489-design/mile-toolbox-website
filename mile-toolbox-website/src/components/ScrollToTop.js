import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** 路由切换时回到顶部（带 hash 锚点的导航除外，交给浏览器锚点定位） */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // 带锚点：滚动到目标元素（等一帧确保已渲染）
      const id = hash.slice(1);
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
      });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);
  return null;
}
