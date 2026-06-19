/** 收藏接口（对接文档 §3，需登录） */
import { get, post, del } from './http';

/** POST /favorite/{toolId} 收藏 */
export const addFavorite = (toolId) => post(`/favorite/${toolId}`);

/** DELETE /favorite/{toolId} 取消收藏 */
export const removeFavorite = (toolId) => del(`/favorite/${toolId}`);

/** GET /favorite/list 我的收藏 → ToolVO[]（favorited 恒 true） */
export const fetchFavorites = () => get('/favorite/list');
