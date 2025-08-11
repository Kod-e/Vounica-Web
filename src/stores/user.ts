import { defineStore } from 'pinia'
import type { components } from '@/types/api'
type UserResp = components['schemas']['UserSchema']

export const useUserStore = defineStore('user', {
  state: () => ({
    id: 0,
    name: 'loading...',
    email: 'email@loading.ac.jp',
    tokenQuota: 0,
    createdAt: '2004-06-22T12:00:00Z',
    updatedAt: '2004-06-22T12:00:00Z',
    lastUpdatedAt: 0,
  }),

  actions: {
    setUser(user: UserResp) {
      this.id = user.id!
      this.name = user.name
      this.email = user.email
      this.tokenQuota = user.token_quota
      this.createdAt = user.created_at
      this.updatedAt = user.updated_at
      this.lastUpdatedAt = Date.now()
    },
    clearUser() {
      this.id = 0
      this.name = 'loading...'
      this.email = 'email@loading.ac.jp'
      this.tokenQuota = 0
      this.createdAt = '2004-06-22T12:00:00Z'
      this.updatedAt = '2004-06-22T12:00:00Z'
      this.lastUpdatedAt = 0
    },
    isUpdated(minutes: number) {
      return Date.now() - this.lastUpdatedAt > minutes * 60 * 1000
    },
    needRefresh() {
      // 如果超过一周，则需要刷新
      return this.isUpdated(7 * 24 * 60)
    },
  },

  persist: {
    key: 'user',
    storage: localStorage,
    paths: [
      'user.id',
      'user.name',
      'user.email',
      'user.tokenQuota',
      'user.createdAt',
      'user.updatedAt',
    ],
  } as unknown as Record<string, unknown>,
})
