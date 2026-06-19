/**
 * 登录态本地存储：token 与用户信息（localStorage）。
 */
const TOKEN_KEY = 'mile-token';
const USER_KEY = 'mile-user';

export function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY) || '';
  } catch (e) {
    return '';
  }
}

export function setToken(token) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    /* ignore */
  }
}

export function clearToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    /* ignore */
  }
}

export function getStoredUser() {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredUser(user) {
  try {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    /* ignore */
  }
}

export function clearStoredUser() {
  try {
    window.localStorage.removeItem(USER_KEY);
  } catch (e) {
    /* ignore */
  }
}

/** 清空全部登录态 */
export function clearAuth() {
  clearToken();
  clearStoredUser();
}
