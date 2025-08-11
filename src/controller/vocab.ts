import { defineStore } from 'pinia'
import type { components } from '@/types/api'
import { fetchVocabularies } from '@/service/vocab'

export const vocabController = defineStore('vocab', {
  state: () => ({
    vocabularies: [] as components['schemas']['VocabSchema'][],
    offset: 0,
    limit: 30,
    isLoading: false,
  }),
  getters: {
    hasPrevPage: (state) => state.offset > 0,
    nowPage: (state) => Math.floor(state.offset / state.limit) + 1,
  },
  actions: {
    async fetchVocabularies() {
      this.isLoading = true
      const vocabularies = await fetchVocabularies(this.offset, this.limit)
      this.vocabularies = vocabularies
      this.isLoading = false
    },
    nextPage() {
      if (this.isLoading) return
      this.offset += this.limit
      this.fetchVocabularies()
    },
    prevPage() {
      if (this.isLoading) return
      if (this.offset - this.limit < 0) return
      this.offset -= this.limit
      this.fetchVocabularies()
    },
  },
})
