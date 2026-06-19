/** 后台 API 数据类型 */

export interface AdminInfo {
  id: number
  username: string
  nickname: string
}

export interface AdminLoginResult {
  token: string
  admin: AdminInfo
}

export interface ToolCategory {
  id: number
  code: string
  name: string
  icon?: string | null
  sort: number
  status: number
}

export interface Tool {
  id: number
  toolKey: string
  name: string
  categoryId: number
  description?: string | null
  icon?: string | null
  handleType: number
  routePath?: string | null
  useCount: number
  status: number
  sort: number
  createTime?: string
  updateTime?: string
}

export interface ToolUser {
  id: number
  username: string
  nickname?: string | null
  avatar?: string | null
  email?: string | null
  phone?: string | null
  status?: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  size: number
}

export interface StatsOverview {
  userCount: number
  toolCount: number
  categoryCount: number
  totalUsage: number
  todayUsage: number
}

export interface TrendPoint {
  date: string
  count: number
}

/** 文件处理任务记录 */
export interface FileTask {
  id: number
  toolKey: string
  fileName?: string | null
  fileSize: number
  fileCount: number
  status: number
  errorMsg?: string | null
  costMs: number
  userId?: number | null
  clientIp?: string | null
  createTime?: string
}

/** 文件任务监控概览 */
export interface FileTaskStats {
  total: number
  successCount: number
  failCount: number
  todayCount: number
}
