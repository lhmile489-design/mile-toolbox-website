/** 本地「最近使用」记录（localStorage，游客也可用；登录用户以后端 /usage/recent 为准）。 */
const KEY = 'mile-recent';
const MAX = 12;

export function getRecent() {
  try {
    const arr = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

export function recordRecent(toolKey) {
  if (!toolKey) return;
  try {
    const arr = getRecent().filter((k) => k !== toolKey);
    arr.unshift(toolKey);
    window.localStorage.setItem(KEY, JSON.stringify(arr.slice(0, MAX)));
  } catch (e) {
    /* ignore */
  }
}
