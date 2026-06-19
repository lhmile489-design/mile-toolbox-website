import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { TOKEN_KEY } from '@/utils/request'

/**
 * 路由即菜单的单一事实来源：layout 侧边栏直接读取 children 中带 meta.title 的项渲染菜单。
 * 新增页面 = 在 children 里加一项（带 title/icon）即可，无需改 layout。
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login.vue'),
    meta: { public: true, title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard.vue'),
        meta: { title: '概览', icon: 'Odometer' },
      },
      {
        path: 'member',
        name: 'member',
        component: () => import('@/views/member/index.vue'),
        meta: { title: '成员管理', icon: 'UserFilled' },
      },
      {
        path: 'order',
        name: 'order',
        component: () => import('@/views/order/index.vue'),
        meta: { title: '订单查询', icon: 'List' },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 路由守卫：未登录访问受保护页 → 跳登录
router.beforeEach((to) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (to.meta.public) return true
  if (!token) return { path: '/login' }
  return true
})

export default router
