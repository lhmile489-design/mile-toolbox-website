import service from '@/utils/request'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { db } from './data'
import type { ApiResult } from '@/utils/request'
import type { Member } from '@/api/types'

/**
 * 内置 mock 层（零依赖）。
 *
 * 实现方式：给 axios 实例挂一个**请求适配器（adapter）**，拦截所有 `/api/*` 请求，
 * 直接返回约定结构 `{ code, msg, data }` 的假数据，无需任何后端。
 *
 * 关闭 mock：设环境变量 `VITE_USE_MOCK=false`（见 .env / README），
 * 届时请求走真实 axios 默认适配器 + `VITE_API_BASE` / vite 代理。
 */
export function setupMock() {
  if (import.meta.env.VITE_USE_MOCK === 'false') {
    return
  }
  service.defaults.adapter = mockAdapter
  // eslint-disable-next-line no-console
  console.info('[mock] 内置 mock 已启用（VITE_USE_MOCK=false 可关闭，改走真实后端）')
}

/** 构造标准成功响应 */
function ok<T>(config: InternalAxiosRequestConfig, data: T): AxiosResponse<ApiResult<T>> {
  return wrap(config, { code: '200', msg: 'success', data })
}

/** 构造标准错误响应 */
function fail(config: InternalAxiosRequestConfig, code: string, msg: string): AxiosResponse<ApiResult> {
  return wrap(config, { code, msg, data: null })
}

function wrap<T>(config: InternalAxiosRequestConfig, body: ApiResult<T>): AxiosResponse<ApiResult<T>> {
  return {
    data: body,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
    request: {},
  }
}

/** 取查询参数 */
function q(config: InternalAxiosRequestConfig, key: string): string | undefined {
  const v = config.params?.[key]
  return v === undefined || v === null || v === '' ? undefined : String(v)
}

/** 模拟网络延迟 */
function delay<T>(value: T, ms = 280): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/** mock 适配器：根据 method + url 路由到处理函数 */
async function mockAdapter(
  config: InternalAxiosRequestConfig,
): Promise<AxiosResponse> {
  const method = (config.method || 'get').toLowerCase()
  // 去掉 baseURL 前缀，得到纯路径
  const raw = config.url || ''
  const url = raw.replace(/^\/api/, '')
  const body = parseBody(config.data)

  // ===== 认证 =====
  if (method === 'post' && url === '/auth/login') {
    const { username, password } = body as { username?: string; password?: string }
    if (username === 'admin' && password === 'admin123') {
      return delay(
        ok(config, {
          token: 'mock-token-' + Date.now(),
          user: { id: 1, username: 'admin', nickname: '管理员', roles: ['admin'] },
        }),
      )
    }
    return delay(fail(config, '10102', '用户名或密码错误'))
  }
  if (method === 'post' && url === '/auth/logout') {
    return delay(ok(config, null))
  }
  if (method === 'get' && url === '/auth/info') {
    return delay(ok(config, { id: 1, username: 'admin', nickname: '管理员', roles: ['admin'] }))
  }

  // ===== 看板 =====
  if (method === 'get' && url === '/dashboard/stats') {
    return delay(
      ok(config, {
        userCount: db.members.length,
        orderCount: db.orders.length,
        revenue: Math.round(db.orders.reduce((s, o) => s + o.amount, 0)),
        todayVisits: 1280 + Math.floor(Math.random() * 200),
      }),
    )
  }
  if (method === 'get' && url === '/dashboard/trend') {
    const days = Number(q(config, 'days') || 7)
    const list = Array.from({ length: days }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (days - 1 - i))
      const date = d.toISOString().slice(0, 10)
      return { date, count: 50 + Math.floor(Math.random() * 200) }
    })
    return delay(ok(config, list))
  }
  if (method === 'get' && url === '/dashboard/category-share') {
    return delay(
      ok(config, [
        { name: '直接访问', value: 335 },
        { name: '搜索引擎', value: 234 },
        { name: '推荐', value: 158 },
        { name: '社交媒体', value: 135 },
        { name: '邮件营销', value: 90 },
      ]),
    )
  }

  // ===== 成员（通用 CRUD） =====
  if (method === 'get' && url === '/member/page') {
    const page = Number(q(config, 'page') || 1)
    const size = Number(q(config, 'size') || 10)
    const keyword = q(config, 'keyword')
    const role = q(config, 'role')
    const status = q(config, 'status')
    let list = [...db.members]
    if (keyword) list = list.filter((m) => m.name.includes(keyword) || m.email.includes(keyword))
    if (role) list = list.filter((m) => m.role === role)
    if (status !== undefined) list = list.filter((m) => m.status === Number(status))
    const total = list.length
    const start = (page - 1) * size
    return delay(ok(config, { list: list.slice(start, start + size), total, page, size }))
  }
  if (method === 'post' && url === '/member') {
    const m = body as Partial<Member>
    const created: Member = {
      id: ++db.memberSeq,
      name: m.name || '未命名',
      email: m.email || '',
      role: (m.role as Member['role']) || 'viewer',
      status: (m.status as 0 | 1) ?? 0,
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    }
    db.members.unshift(created)
    return delay(ok(config, created))
  }
  if (method === 'put' && url === '/member') {
    const m = body as Partial<Member>
    const idx = db.members.findIndex((x) => x.id === m.id)
    if (idx >= 0) {
      db.members[idx] = { ...db.members[idx], ...m } as Member
      return delay(ok(config, db.members[idx]))
    }
    return delay(fail(config, '10002', '数据不存在'))
  }
  const statusMatch = url.match(/^\/member\/(\d+)\/status$/)
  if (method === 'put' && statusMatch) {
    const id = Number(statusMatch[1])
    const status = Number(q(config, 'status'))
    const m = db.members.find((x) => x.id === id)
    if (m) {
      m.status = status as 0 | 1
      return delay(ok(config, null))
    }
    return delay(fail(config, '10002', '数据不存在'))
  }
  const delMatch = url.match(/^\/member\/(\d+)$/)
  if (method === 'delete' && delMatch) {
    const id = Number(delMatch[1])
    db.members = db.members.filter((x) => x.id !== id)
    return delay(ok(config, null))
  }

  // ===== 订单（只读列表 + 筛选） =====
  if (method === 'get' && url === '/order/page') {
    const page = Number(q(config, 'page') || 1)
    const size = Number(q(config, 'size') || 10)
    const keyword = q(config, 'keyword')
    const status = q(config, 'status')
    let list = [...db.orders]
    if (keyword)
      list = list.filter((o) => o.orderNo.includes(keyword) || o.customer.includes(keyword))
    if (status) list = list.filter((o) => o.status === status)
    const total = list.length
    const start = (page - 1) * size
    return delay(ok(config, { list: list.slice(start, start + size), total, page, size }))
  }

  // 未匹配
  return delay(fail(config, '10404', `mock 未实现的接口：${method.toUpperCase()} ${url}`))
}

/** 解析请求体（可能是 JSON 字符串或对象） */
function parseBody(data: unknown): Record<string, unknown> {
  if (!data) return {}
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch {
      return {}
    }
  }
  return data as Record<string, unknown>
}
