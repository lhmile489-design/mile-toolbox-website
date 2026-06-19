/** 工具中心接口（对接文档 §2） */
import { get, post } from './http';

/** GET /tool/categories 分类列表 */
export const fetchCategories = () => get('/tool/categories');

/** GET /tool/list 工具清单（可按 categoryId / keyword 过滤） */
export const fetchTools = ({ categoryId, keyword } = {}) =>
  get('/tool/list', { params: { categoryId, keyword } });

/** GET /tool/detail/{toolKey} 工具详情 */
export const fetchToolDetail = (toolKey) => get(`/tool/detail/${encodeURIComponent(toolKey)}`);

/** GET /tool/hot?limit=&by= 热门工具（by: count 按次数(默认) / users 按去重登录用户数） */
export const fetchHotTools = (limit = 10, by) => get('/tool/hot', { params: { limit, by } });

/** POST /tool/use/{toolKey} 上报使用（前端工具用完调用） */
export const reportToolUse = (toolKey) => post(`/tool/use/${encodeURIComponent(toolKey)}`);
