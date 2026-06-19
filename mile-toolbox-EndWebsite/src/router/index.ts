import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { ADMIN_TOKEN_KEY } from '@/utils/request'

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
        meta: { title: '概览', icon: 'DataLine' },
      },
      {
        path: 'tool',
        name: 'tool',
        component: () => import('@/views/tool/index.vue'),
        meta: { title: '工具管理', icon: 'Tools' },
      },
      {
        path: 'playground',
        name: 'playground',
        component: () => import('@/views/playground/index.vue'),
        meta: { title: '工具试用台', icon: 'MagicStick' },
      },
      {
        path: 'category',
        name: 'category',
        component: () => import('@/views/category/index.vue'),
        meta: { title: '分类管理', icon: 'Menu' },
      },
      {
        path: 'user',
        name: 'user',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '用户管理', icon: 'User' },
      },
      {
        path: 'file-task',
        name: 'file-task',
        component: () => import('@/views/file-task/index.vue'),
        meta: { title: '文件任务监控', icon: 'Document' },
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
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (to.meta.public) {
    return true
  }
  if (!token) {
    return { path: '/login' }
  }
  return true
})

export default router
