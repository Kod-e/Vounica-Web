import { defineStore } from 'pinia'
import type { components } from '@/types/api'
import { fetchGrammars } from '@/service/grammar'

export const grammarController = defineStore('grammar', {
  state: () => ({
    grammars: [] as components['schemas']['GrammarSchema'][],
    offset: 0,
    limit: 30,
    isLoading: false,
  }),
  getters: {
    hasPrevPage: (state) => state.offset > 0,
    nowPage: (state) => Math.floor(state.offset / state.limit) + 1,
  },
  actions: {
    async fetchGrammars() {
      this.isLoading = true
      const grammars = await fetchGrammars(this.offset, this.limit)
      this.grammars = grammars
      this.isLoading = false
    },
    nextPage() {
      if (this.isLoading) return
      this.offset += this.limit
      this.fetchGrammars()
    },
    prevPage() {
      if (this.isLoading) return
      if (this.offset - this.limit < 0) return
      this.offset -= this.limit
      this.fetchGrammars()
    },
  },
})
