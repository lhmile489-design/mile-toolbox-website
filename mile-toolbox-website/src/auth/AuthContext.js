import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as userApi from '../api/user';
import { setToken, setStoredUser, getStoredUser, getToken, clearAuth } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  // 登录失效（http 层广播）：清空本地用户态
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('mile:unauthorized', onUnauthorized);
    return () => window.removeEventListener('mile:unauthorized', onUnauthorized);
  }, []);

  // 启动时若有 token，静默刷新一次用户信息（失败不阻塞）
  useEffect(() => {
    if (!getToken()) return;
    userApi
      .fetchUserInfo()
      .then((info) => {
        setUser(info);
        setStoredUser(info);
      })
      .catch(() => {
        /* 10005 会由 http 层清理并广播；其余错误忽略 */
      });
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await userApi.login(credentials);
    setToken(data.token);
    setStoredUser(data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    return userApi.register(payload);
  }, []);

  const logout = useCallback(async () => {
    try {
      await userApi.logout();
    } catch (e) {
      /* 即便后端登出失败也清本地态 */
    }
    clearAuth();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const updated = await userApi.updateUserInfo(payload);
    setUser(updated);
    setStoredUser(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, register, logout, updateProfile }),
    [user, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
