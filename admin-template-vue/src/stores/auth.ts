import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as apiLogin, logout as apiLogout, getUserInfo } from '@/api/auth'
import type { UserInfo } from '@/api/types'
import { TOKEN_KEY } from '@/utils/request'

/** 认证状态：token + 当前用户信息 */
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '')
  const info = ref<UserInfo | null>(null)

  async function login(username: string, password: string) {
    const res = await apiLogin({ username, password })
    token.value = res.token
    info.value = res.user
    localStorage.setItem(TOKEN_KEY, res.token)
  }

  async function fetchInfo() {
    info.value = await getUserInfo()
    return info.value
  }

  async function logout() {
    try {
      await apiLogout()
    } finally {
      token.value = ''
      info.value = null
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  return { token, info, login, fetchInfo, logout }
})
