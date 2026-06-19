/** 最近使用接口（对接文档 §4，需登录） */
import { get } from './http';

/** GET /usage/recent?limit= 最近使用 → ToolVO[] */
export const fetchRecentUsage = (limit = 12) => get('/usage/recent', { params: { limit } });
