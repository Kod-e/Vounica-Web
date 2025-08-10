// src/stores/auth.ts
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: '' as string,
    refreshToken: '' as string | null,
  }),

  getters: {
    hasAccess: (s) => Boolean(s.accessToken),
    hasRefresh: (s) => Boolean(s.refreshToken),
  },

  actions: {
    setTokens(accessToken: string, refreshToken?: string | null) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken ?? null
    },
    setAccessToken(token: string) {
      this.accessToken = token
    },
    setRefreshToken(token: string | null) {
      this.refreshToken = token
    },
    clear() {
      this.accessToken = ''
      this.refreshToken = null
    },
  },

  persist: {
    key: 'auth',
    storage: localStorage,
    paths: ['accessToken', 'refreshToken'],
  } as unknown as Record<string, unknown>,
})
