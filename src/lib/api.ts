// src/lib/api.ts
import createClient from 'openapi-fetch'
import type { paths } from '@/types/api'
import { apiBase } from './apiBase'
import { useNotifyStore } from '@/stores/notify'
import { useLangStore } from '@/stores/lang'
import { i18n } from '@/plugins/i18n'

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

// 供手写 fetch（如 SSE）场景使用，构造带鉴权与语言信息的 Headers
export async function buildAuthHeaders(extra?: Record<string, string>): Promise<Headers> {
  const headers = new Headers()
  if (handlers) {
    const token = await handlers.getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }
  const langStore = useLangStore()
  headers.set('Accept-Language', langStore.acceptLanguage)
  headers.set('Target-Language', langStore.targetLanguage)
  if (extra) {
    for (const [k, v] of Object.entries(extra)) headers.set(k, v)
  }
  return headers
}

// 暴露 handlers 以便在 401 时进行统一处理（仅在确需时使用）
export function getAuthHandlers(): AuthHandlers | null {
  return handlers
}

api.use({
  async onRequest({ request }: { request: Request }) {
    if (!handlers) return request
    const token = await handlers.getToken()
    if (!token) return request
    const headers = new Headers(request.headers)
    const langStore = useLangStore()
    headers.set('Authorization', `Bearer ${token}`)
    headers.set('Accept-Language', langStore.acceptLanguage)
    headers.set('Target-Language', langStore.targetLanguage)
    return new Request(request, { headers })
  },
  async onResponse({ response }: { response: Response }) {
    // 在200/201时直接return
    if (response.status === 200 || response.status === 201) return response

    const notifyStore = useNotifyStore()
    // 尝试在response中找到message字段
    try {
      const data = await response.json()
      if ((data as { message?: string }).message) {
        notifyStore.addNotify((data as { message: string }).message)
      }
    } catch {
      notifyStore.addNotify(response.statusText)
    }

    // 401时, 视为当前会话无效, 切换到游客
    if (response.status === 401 && handlers) {
      await handlers.onAuthLost()
      return response
    }

    throw response
  },
})

// 统一处理网络层错误（如 DNS 解析失败、服务器不可达、CORS 拒绝等）
api.use({
  onError({ error }: { error: unknown }) {
    // 若是 HTTP 响应错误（已在 onResponse 中存在)
    if (error instanceof Response) {
      throw error
    }

    const notifyStore = useNotifyStore()
    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false
    const t = i18n.global.t as (key: string) => string
    const message = isOffline ? t('networkOffline') : t('networkConnectFailed')
    try {
      notifyStore.addNotify(message)
    } catch {}
    throw error
  },
})
