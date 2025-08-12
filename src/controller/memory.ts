import { defineStore } from 'pinia'
import type { components } from '@/types/api'
import { fetchMemoryCategories, fetchMemoryByCategory } from '@/service/memory'

export const memoryController = defineStore('memory', {
  state: () => ({
    categories: [] as string[],
    selectedCategory: null as string | null,
    memories: [] as components['schemas']['MemorySchema'][],
    offset: 0,
    limit: 30,
    isLoading: false,
  }),
  getters: {
    hasPrevPage: (state) => state.offset > 0,
    nowPage: (state) => Math.floor(state.offset / state.limit) + 1,
  },
  actions: {
    async fetchCategories() {
      this.isLoading = true
      const categories = await fetchMemoryCategories()
      this.categories = categories
      this.isLoading = false
    },
    async setFakeCategories() {
      this.categories = ['test1', 'test2', 'test3']
    },
    async fetchMemoriesByCategory() {
      if (!this.selectedCategory) return
      this.isLoading = true
      const memories = await fetchMemoryByCategory(this.selectedCategory, this.offset, this.limit)
      this.memories = memories
      this.isLoading = false
    },
    async selectCategory(category: string) {
      this.isLoading = true
      this.selectedCategory = category
      await this.fetchMemoriesByCategory()
      this.isLoading = false
    },
    nextPage() {
      if (this.isLoading) return
      this.offset += this.limit
      this.fetchMemoriesByCategory()
    },
    prevPage() {
      if (this.isLoading) return
      if (this.offset - this.limit < 0) return
      this.offset -= this.limit
      this.fetchMemoriesByCategory()
    },
  },
})
