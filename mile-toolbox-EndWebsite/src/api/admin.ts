import { request } from '@/utils/request'
import type {
  AdminInfo,
  AdminLoginResult,
  FileTask,
  FileTaskStats,
  PageResult,
  StatsOverview,
  Tool,
  ToolCategory,
  ToolUser,
  TrendPoint,
} from './types'

// ===== 认证 =====
export function adminLogin(data: { username: string; password: string }) {
  return request<AdminLoginResult>({ url: '/admin/auth/login', method: 'post', data })
}
export function adminLogout() {
  return request<void>({ url: '/admin/auth/logout', method: 'post' })
}
export function adminInfo() {
  return request<AdminInfo>({ url: '/admin/auth/info', method: 'get' })
}

// ===== 工具管理 =====
export function toolPage(params: {
  page: number
  size: number
  categoryId?: number
  keyword?: string
}) {
  return request<PageResult<Tool>>({ url: '/admin/tool/page', method: 'get', params })
}
export function toolCreate(data: Partial<Tool>) {
  return request<Tool>({ url: '/admin/tool', method: 'post', data })
}
export function toolUpdate(data: Partial<Tool>) {
  return request<Tool>({ url: '/admin/tool', method: 'put', data })
}
export function toolChangeStatus(id: number, status: number) {
  return request<void>({ url: `/admin/tool/${id}/status`, method: 'put', params: { status } })
}
export function toolDelete(id: number) {
  return request<void>({ url: `/admin/tool/${id}`, method: 'delete' })
}

// ===== 分类管理 =====
export function categoryList() {
  return request<ToolCategory[]>({ url: '/admin/category/list', method: 'get' })
}
export function categoryCreate(data: Partial<ToolCategory>) {
  return request<ToolCategory>({ url: '/admin/category', method: 'post', data })
}
export function categoryUpdate(data: Partial<ToolCategory>) {
  return request<ToolCategory>({ url: '/admin/category', method: 'put', data })
}
export function categoryDelete(id: number) {
  return request<void>({ url: `/admin/category/${id}`, method: 'delete' })
}

// ===== 用户管理 =====
export function userPage(params: { page: number; size: number; keyword?: string }) {
  return request<PageResult<ToolUser>>({ url: '/admin/user/page', method: 'get', params })
}
export function userChangeStatus(id: number, status: number) {
  return request<void>({ url: `/admin/user/${id}/status`, method: 'put', params: { status } })
}

// ===== 统计 =====
export function statsOverview() {
  return request<StatsOverview>({ url: '/admin/stats/overview', method: 'get' })
}
export function statsHotTools(limit = 10) {
  return request<Tool[]>({ url: '/admin/stats/hot-tools', method: 'get', params: { limit } })
}
export function statsUsageTrend(days = 7) {
  return request<TrendPoint[]>({ url: '/admin/stats/usage-trend', method: 'get', params: { days } })
}

// ===== 文件任务监控 =====
export function fileTaskPage(params: {
  page: number
  size: number
  toolKey?: string
  status?: number
  keyword?: string
}) {
  return request<PageResult<FileTask>>({ url: '/admin/file-task/page', method: 'get', params })
}
export function fileTaskDetail(id: number) {
  return request<FileTask>({ url: `/admin/file-task/${id}`, method: 'get' })
}
export function fileTaskStats() {
  return request<FileTaskStats>({ url: '/admin/file-task/stats', method: 'get' })
}
