import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: '' as string,
    refreshToken: '' as string,
    updatedAt: 0 as number,
  }),

  getters: {
    hasAccess: (s) => Boolean(s.accessToken),
    hasRefresh: (s) => Boolean(s.refreshToken),
  },

  actions: {
    setTokens(accessToken: string, refreshToken: string) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
      this.updatedAt = Date.now()
    },
    setAccessToken(token: string) {
      this.accessToken = token
      this.updatedAt = Date.now()
    },
    setRefreshToken(token: string) {
      this.refreshToken = token
      this.updatedAt = Date.now()
    },
    clear() {
      this.accessToken = ''
      this.refreshToken = ''
      this.updatedAt = 0
    },
  },

  persist: {
    key: 'auth',
    storage: localStorage,
    paths: ['accessToken', 'refreshToken'],
  } as unknown as Record<string, unknown>,
})
