// src/lib/api.ts
import createClient from 'openapi-fetch'
import type { paths } from '@/types/api'
import { apiBase } from './apiBase'

// 业务用 openapi-fetch 客户端（不直接依赖 auth / router）
// 通过 bindAuth 注入“如何取 token / 刷新 / 会话失效处理”
export const api = createClient<paths>({ baseUrl: apiBase })

export type AuthHandlers = {
  getToken: () => Promise<string | ''> // 需要时拿到 access token（可触发游客登录）
  tryRefresh: () => Promise<void> // 401 时尝试刷新；失败应清理会话
  onAuthLost?: (redirectTo?: string) => void // 刷新失败或仍 401：由外部决定跳登录或弹窗
}

let handlers: AuthHandlers | null = null
export function bindAuth(h: AuthHandlers) {
  handlers = h
}

api.use({
  async onRequest({ request }) {
    if (!handlers) return request
    const token = await handlers.getToken()
    if (!token) return request
    const headers = new Headers(request.headers)
    headers.set('Authorization', `Bearer ${token}`)
    return new Request(request, { headers })
  },

  // 晚点再写onError
})
