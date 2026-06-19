import { request } from '@/utils/request'
import type { LoginResult, UserInfo } from './types'

export function login(data: { username: string; password: string }) {
  return request<LoginResult>({ url: '/auth/login', method: 'post', data })
}

export function logout() {
  return request<void>({ url: '/auth/logout', method: 'post' })
}

export function getUserInfo() {
  return request<UserInfo>({ url: '/auth/info', method: 'get' })
}
