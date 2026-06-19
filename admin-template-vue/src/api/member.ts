import { request } from '@/utils/request'
import type { Member, PageResult } from './types'

/** 分页查询成员（通用 CRUD 示例资源） */
export function memberPage(params: {
  page: number
  size: number
  keyword?: string
  role?: string
  status?: number
}) {
  return request<PageResult<Member>>({ url: '/member/page', method: 'get', params })
}

export function memberCreate(data: Partial<Member>) {
  return request<Member>({ url: '/member', method: 'post', data })
}

export function memberUpdate(data: Partial<Member>) {
  return request<Member>({ url: '/member', method: 'put', data })
}

export function memberChangeStatus(id: number, status: number) {
  return request<void>({ url: `/member/${id}/status`, method: 'put', params: { status } })
}

export function memberDelete(id: number) {
  return request<void>({ url: `/member/${id}`, method: 'delete' })
}
