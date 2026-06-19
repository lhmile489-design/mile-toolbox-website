import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminInfo, adminLogin, adminLogout } from '@/api/admin'
import type { AdminInfo } from '@/api/types'
import { ADMIN_TOKEN_KEY } from '@/utils/request'

export const useAdminStore = defineStore('admin', () => {
  const token = ref<string>(localStorage.getItem(ADMIN_TOKEN_KEY) || '')
  const info = ref<AdminInfo | null>(null)

  /** 登录 */
  async function login(username: string, password: string) {
    const res = await adminLogin({ username, password })
    token.value = res.token
    info.value = res.admin
    localStorage.setItem(ADMIN_TOKEN_KEY, res.token)
  }

  /** 拉取当前管理员信息 */
  async function fetchInfo() {
    info.value = await adminInfo()
    return info.value
  }

  /** 登出 */
  async function logout() {
    try {
      await adminLogout()
    } finally {
      token.value = ''
      info.value = null
      localStorage.removeItem(ADMIN_TOKEN_KEY)
    }
  }

  return { token, info, login, fetchInfo, logout }
})
