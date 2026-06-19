import { request } from '@/utils/request'
import type { OrderRow, PageResult } from './types'

/** 分页查询订单（表格筛选示例，只读） */
export function orderPage(params: {
  page: number
  size: number
  keyword?: string
  status?: string
}) {
  return request<PageResult<OrderRow>>({ url: '/order/page', method: 'get', params })
}
