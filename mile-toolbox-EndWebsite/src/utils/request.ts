import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

/** 后端统一响应结构 */
export interface ApiResult<T = unknown> {
  code: string
  msg: string
  data: T
}

/** 管理员 token 存储 key（与前台用户 token 隔离） */
export const ADMIN_TOKEN_KEY = 'admin-token'

const service: AxiosInstance = axios.create({
  baseURL: '/',
  timeout: 30000,
})

// 请求拦截：带上管理员 token
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY)
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截：按统一错误码处理（只在 10005 登出）
service.interceptors.response.use(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (response: AxiosResponse<ApiResult>): any => {
    const res = response.data
    // 文件流等非标准结构直接返回
    if (res == null || typeof res.code === 'undefined') {
      return response.data
    }
    if (res.code === '200') {
      return res.data
    }
    // 鉴权失效：清 token 跳登录
    if (res.code === '10005') {
      localStorage.removeItem(ADMIN_TOKEN_KEY)
      if (location.hash !== '#/login') {
        location.href = '#/login'
      }
      ElMessage.error(res.msg || '登录已失效')
      return Promise.reject(new Error(res.msg))
    }
    // 其他业务错误：提示，不登出
    ElMessage.error(res.msg || '请求失败')
    return Promise.reject(new Error(res.msg))
  },
  (error) => {
    ElMessage.error(error?.message || '网络异常')
    return Promise.reject(error)
  },
)

/** 统一请求方法，返回 data 部分 */
export function request<T = unknown>(config: Parameters<AxiosInstance['request']>[0]): Promise<T> {
  return service.request(config) as unknown as Promise<T>
}

export default service
