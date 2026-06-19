import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCategories, fetchTools, fetchHotTools } from '../api/tools';
import { addFavorite, removeFavorite } from '../api/favorite';
import {
  CATEGORIES_SEED,
  TOOLS_SEED,
  normalizeCategory,
  normalizeTool,
} from './tools';
import { useAuth } from '../auth/AuthContext';

const ToolDataContext = createContext(null);
const HOT_LIMIT = 8;

function indexById(categories) {
  return categories.reduce((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {});
}

/** 把分类 + 工具 + 热门规整成统一结构 */
function build(rawCategories, rawTools, rawHot) {
  const categories = rawCategories.map(normalizeCategory).sort((a, b) => (a.sort || 0) - (b.sort || 0));
  const byId = indexById(categories);
  const tools = rawTools.map((t) => normalizeTool(t, byId));
  const hot = rawHot.map((t) => normalizeTool(t, byId));
  return { categories, tools, hot, byId };
}

/** 离线兜底（后端不可达时仍能渲染） */
function buildSeed() {
  const hotSeed = [...TOOLS_SEED].sort((a, b) => b.useCount - a.useCount).slice(0, HOT_LIMIT);
  return build(CATEGORIES_SEED, TOOLS_SEED, hotSeed);
}

export function ToolDataProvider({ children }) {
  const seed = useMemo(buildSeed, []);
  const [categories, setCategories] = useState(seed.categories);
  const [tools, setTools] = useState(seed.tools);
  const [hot, setHot] = useState(seed.hot);
  const [categoriesById, setCategoriesById] = useState(seed.byId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const { user } = useAuth();
  const userId = user ? user.id : null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rawCategories, rawTools, rawHot] = await Promise.all([
        fetchCategories(),
        fetchTools(),
        fetchHotTools(HOT_LIMIT),
      ]);
      const next = build(rawCategories || [], rawTools || [], rawHot || []);
      setCategories(next.categories);
      setTools(next.tools);
      setHot(next.hot);
      setCategoriesById(next.byId);
      setUsingFallback(false);
      setError(null);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[ToolData] 接口加载失败，使用离线种子数据：', e.code || '', e.message || e);
      setUsingFallback(true);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // 首次加载 + 登录态变化时重拉（带 token 才能拿到 favorited 标记）
  useEffect(() => {
    load();
  }, [load, userId]);

  /** 把某工具的 favorited 同步到 tools / hot 两个列表 */
  const applyFavorited = useCallback((toolId, favorited) => {
    const patch = (list) => list.map((t) => (t.id === toolId ? { ...t, favorited } : t));
    setTools(patch);
    setHot(patch);
  }, []);

  /** 收藏 / 取消收藏（乐观更新，失败回滚） */
  const toggleFavorite = useCallback(
    async (tool) => {
      const next = !tool.favorited;
      applyFavorited(tool.id, next);
      try {
        if (next) await addFavorite(tool.id);
        else await removeFavorite(tool.id);
      } catch (e) {
        applyFavorited(tool.id, !next);
        throw e;
      }
    },
    [applyFavorited]
  );

  /** 用当前分类把后端工具 VO 规整成统一结构（供最近使用/收藏列表复用） */
  const normalizeTools = useCallback(
    (rawTools) => (rawTools || []).map((t) => normalizeTool(t, categoriesById)),
    [categoriesById]
  );

  const favorites = useMemo(() => tools.filter((t) => t.favorited), [tools]);

  const value = useMemo(
    () => ({
      categories,
      tools,
      hot,
      favorites,
      loading,
      error,
      usingFallback,
      reload: load,
      toggleFavorite,
      normalizeTools,
    }),
    [categories, tools, hot, favorites, loading, error, usingFallback, load, toggleFavorite, normalizeTools]
  );

  return <ToolDataContext.Provider value={value}>{children}</ToolDataContext.Provider>;
}

export function useToolData() {
  const ctx = useContext(ToolDataContext);
  if (!ctx) throw new Error('useToolData must be used within a ToolDataProvider');
  return ctx;
}
