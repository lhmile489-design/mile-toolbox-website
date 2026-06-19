import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

/** 后端统一响应结构（约定：成功 code='200'，data 为业务数据） */
export interface ApiResult<T = unknown> {
  code: string
  msg: string
  data: T
}

/** 登录 token 的本地存储 key */
export const TOKEN_KEY = 'admin-template-token'

/** 鉴权失效错误码（仅此码触发登出跳登录页） */
const CODE_UNAUTHORIZED = '10005'

const isMock = import.meta.env.VITE_USE_MOCK !== 'false'
// mock 模式下 baseURL 用 '/api'（被 mock 适配器拦截）；真实模式可用 VITE_API_BASE 覆盖
const baseURL = isMock ? '/api' : import.meta.env.VITE_API_BASE || '/api'

const service: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
})

// 请求拦截：带上 token
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截：按统一错误码处理（只在鉴权失效码登出）
service.interceptors.response.use(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (response: AxiosResponse<ApiResult>): any => {
    const res = response.data
    // 非标准结构（如文件流）直接返回
    if (res == null || typeof res.code === 'undefined') {
      return response.data
    }
    if (res.code === '200') {
      return res.data
    }
    if (res.code === CODE_UNAUTHORIZED) {
      localStorage.removeItem(TOKEN_KEY)
      if (location.hash !== '#/login') {
        location.href = '#/login'
      }
      ElMessage.error(res.msg || '登录已失效')
      return Promise.reject(new Error(res.msg))
    }
    ElMessage.error(res.msg || '请求失败')
    return Promise.reject(new Error(res.msg))
  },
  (error) => {
    ElMessage.error(error?.message || '网络异常')
    return Promise.reject(error)
  },
)

/** 统一请求方法，直接解析出 data 部分 */
export function request<T = unknown>(config: Parameters<AxiosInstance['request']>[0]): Promise<T> {
  return service.request(config) as unknown as Promise<T>
}

export default service
