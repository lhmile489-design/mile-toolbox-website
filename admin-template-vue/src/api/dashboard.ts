import { request } from '@/utils/request'
import type { CategoryShare, DashboardStats, TrendPoint } from './types'

export function getStats() {
  return request<DashboardStats>({ url: '/dashboard/stats', method: 'get' })
}

export function getTrend(days = 7) {
  return request<TrendPoint[]>({ url: '/dashboard/trend', method: 'get', params: { days } })
}

export function getCategoryShare() {
  return request<CategoryShare[]>({ url: '/dashboard/category-share', method: 'get' })
}
