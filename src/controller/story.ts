import { defineStore } from 'pinia'
import type { components } from '@/types/api'
import { fetchStoryCategories, fetchStoryByCategory } from '@/service/story'
import { addStory as addStoryApi } from '@/service/story'

export const storyController = defineStore('story', {
  state: () => ({
    categories: [] as string[],
    selectedCategory: null as string | null,
    stories: [] as components['schemas']['StorySchema'][],
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
      const categories = await fetchStoryCategories()
      this.categories = categories
      this.isLoading = false
    },
    async setFakeCategories() {
      this.categories = ['test1', 'test2', 'test3']
    },
    async fetchStoriesByCategory() {
      if (!this.selectedCategory) return
      this.isLoading = true
      const stories = await fetchStoryByCategory(this.selectedCategory, this.offset, this.limit)
      this.stories = stories
      this.isLoading = false
    },
    async selectCategory(category: string) {
      this.isLoading = true
      this.selectedCategory = category
      await this.fetchStoriesByCategory()
      this.isLoading = false
    },
    nextPage() {
      if (this.isLoading) return
      this.offset += this.limit
      this.fetchStoriesByCategory()
    },
    prevPage() {
      if (this.isLoading) return
      if (this.offset - this.limit < 0) return
      this.offset -= this.limit
      this.fetchStoriesByCategory()
    },
    async createStory(content: string, category: string) {
      if (!content?.trim()) return
      const normalizedCategory = category?.trim()
      if (!normalizedCategory) return
      this.isLoading = true
      try {
        const created = await addStoryApi(content.trim(), normalizedCategory)
        if (!this.categories.includes(normalizedCategory)) {
          this.categories.push(normalizedCategory)
        }
        this.selectedCategory = normalizedCategory
        this.offset = 0
        await this.fetchStoriesByCategory()
        return created
      } finally {
        this.isLoading = false
      }
    },
  },
})
