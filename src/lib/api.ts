// src/lib/api.ts
import createClient from 'openapi-fetch'
import type { paths } from '@/types/api'
import { apiBase } from './apiBase'
import { useNotifyStore } from '@/stores/notify'
import { useLangStore } from '@/stores/lang'

// 业务用 openapi-fetch 客户端（不直接依赖 auth / router）
// 通过 bindAuth 注入“如何取 token / 刷新 / 会话失效处理”
export const api = createClient<paths>({ baseUrl: apiBase })

export type AuthHandlers = {
  getToken: () => Promise<string | ''> // 需要时拿到 access token（可触发游客登录）
  onAuthLost: () => Promise<void> // 刷新失败, 得到明确的401 code, 这个时候重新获取新的游客
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
    const langStore = useLangStore()
    headers.set('Accept-Language', langStore.acceptLanguage)
    headers.set('Target-Language', langStore.targetLanguage)
    return new Request(request, { headers })
  },
  async onResponse({ response }) {
    // 在200/201时直接return
    if (response.status === 200 || response.status === 201) return response

    const notifyStore = useNotifyStore()
    // 尝试在response中找到message字段
    try {
      const data = await response.json()
      if (data.message) {
        notifyStore.addNotify(data.message)
      }
    } catch {
      notifyStore.addNotify(response.statusText)
    }

    // 401时, 视为当前会话无效, 切换到游客
    if (response.status === 401) {
      await handlers!.onAuthLost()
      return response
    }

    throw response
  },
})
