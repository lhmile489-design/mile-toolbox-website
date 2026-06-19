/** 后台 API 数据类型（通用模板） */

/** 当前登录用户 */
export interface UserInfo {
  id: number
  username: string
  nickname: string
  roles: string[]
}

/** 登录返回 */
export interface LoginResult {
  token: string
  user: UserInfo
}

/** 统一分页结果 */
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  size: number
}

/** 概览统计（看板卡片） */
export interface DashboardStats {
  userCount: number
  orderCount: number
  revenue: number
  todayVisits: number
}

/** 趋势点（看板折线） */
export interface TrendPoint {
  date: string
  count: number
}

/** 分类占比（看板饼图） */
export interface CategoryShare {
  name: string
  value: number
}

/** 示例资源：成员（演示通用 CRUD） */
export interface Member {
  id: number
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  status: 0 | 1
  createTime: string
}

/** 示例订单（演示表格筛选/只读列表） */
export interface OrderRow {
  id: number
  orderNo: string
  customer: string
  amount: number
  status: 'pending' | 'paid' | 'shipped' | 'done' | 'canceled'
  createTime: string
}
