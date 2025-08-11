// src/plugins/apiAuth.ts
import { bindAuth } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { authGuest, authRefresh } from '@/lib/authClient'
import { jwtDecode } from 'jwt-decode'

let refreshInFlight: Promise<void> | null = null

// 更新当前的refresh token
function refreshOnce(): Promise<void> {
  if (refreshInFlight) return refreshInFlight
  const s = useAuthStore()
  refreshInFlight = (async () => {
    if (!s.refreshToken) throw new Error('NO_REFRESH_TOKEN')
    const { access_token } = await authRefresh({ refresh_token: s.refreshToken })
    s.setTokens(access_token, s.refreshToken)
  })().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

// 获取
export function installApiAuth() {
  // 1) 把“如何取 token / 刷新 / 失效处理”注入给 api 的拦截器
  bindAuth({
    async getToken() {
      const s = useAuthStore()
      if (s.accessToken !== '') {
        //拆包JWT, 检测是否小于6小时, 小于6小时则刷新
        const decoded = jwtDecode(s.accessToken)
        const now = Date.now()
        const exp = decoded.exp! * 1000
        if (now < exp - 6 * 60 * 60 * 1000) {
          return s.accessToken
        }
        try {
          await refreshOnce()
        } catch {
          s.clear()
          // 获取新的游客
          const { access_token, refresh_token } = await authGuest()
          s.setTokens(access_token, refresh_token)
        }
        return s.accessToken
      }
      // 没有 accessToken 获取游客
      const { access_token, refresh_token } = await authGuest()
      s.setTokens(access_token, refresh_token)
      return s.accessToken
    },
    async onAuthLost() {
      const s = useAuthStore()
      s.clear()
      // 获取新的游客
      const { access_token, refresh_token } = await authGuest()
      s.setTokens(access_token, refresh_token)
    },
  })
}
