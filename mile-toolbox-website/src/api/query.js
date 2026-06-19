/** 查询类后端工具接口（对接文档：前台-后端工具处理-对接文档.md §2） */
import { get } from './http';

/**
 * GET /query/geocode 地理编码（正向/逆向）
 * 正向：{ address, city? } → 候选数组
 * 逆向：{ lng, lat, spatialReference? } → 结构化地址对象
 */
export const geocode = (params) => get('/query/geocode', { params });

/** GET /query/ip-location IP 归属地（ip 可选，不传取请求来源 IP） */
export const ipLocation = (ip) => get('/query/ip-location', { params: { ip } });

/** GET /query/phone-location 手机号归属地（phone 必填，11 位） */
export const phoneLocation = (phone) => get('/query/phone-location', { params: { phone } });

/** GET /query/zipcode 邮编查询（keyword = 区县/市/省名 或 邮编数字） */
export const zipcode = (keyword) => get('/query/zipcode', { params: { keyword } });

/**
 * GET /query/currency 货币汇率换算
 * { from, to, amount? } → { from, to, rate, amount, result, updatedAt }
 */
export const currency = (params) => get('/query/currency', { params });

/**
 * GET /query/weather 天气查询（city 可选，不传按来源 IP 定位）
 * → { city, temp, weather, humidity, wind, forecast:[{date,high,low,weather}] }
 */
export const weather = (city) => get('/query/weather', { params: { city } });
