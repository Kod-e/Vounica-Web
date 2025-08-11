import { defineStore } from 'pinia'
import type { components } from '@/types/api'
import { fetchMistakes } from '@/service/mistake'

export const mistakeController = defineStore('mistake', {
  state: () => ({
    mistakes: [] as components['schemas']['MistakeSchema'][],
    offset: 0,
    limit: 30,
    isLoading: false,
  }),
  getters: {
    hasPrevPage: (state) => state.offset > 0,
    nowPage: (state) => Math.floor(state.offset / state.limit) + 1,
  },
  actions: {
    async fetchMistakes() {
      this.isLoading = true
      const mistakes = await fetchMistakes(this.offset, this.limit)
      this.mistakes = mistakes
      this.isLoading = false
    },
    nextPage() {
      if (this.isLoading) return
      this.offset += this.limit
      this.fetchMistakes()
    },
    prevPage() {
      if (this.isLoading) return
      if (this.offset - this.limit < 0) return
      this.offset -= this.limit
      this.fetchMistakes()
    },
  },
})
