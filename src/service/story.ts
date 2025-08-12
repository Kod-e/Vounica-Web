import { api } from '@/lib/api'
import type { components } from '@/types/api'
import { useLangStore } from '@/stores/lang'
type StoryResp = components['schemas']['StorySchema']

export async function addStory(content: string, category: string) {
  const langStore = useLangStore()
  const targetLang = langStore.targetLanguage
  const { data, error } = await api.POST('/v1/story/create', {
    body: {
      content,
      category,
      summary: '',
      language: targetLang,
    },
  })
  if (error) throw error
  if (!data) throw new Error('Empty response')
  return data
}

export async function fetchStories(offset: number, limit: number): Promise<StoryResp[]> {
  const { data, error } = await api.GET('/v1/story/page', {
    query: {
      offset,
      limit,
    },
  })
  if (error) throw error
  if (!data) throw new Error('Empty response')
  return data
}

export async function fetchStoryCategories(): Promise<string[]> {
  const { data, error } = await api.GET('/v1/story/categories')
  if (error) throw error
  if (!data) throw new Error('Empty response')
  return data
}

export async function fetchStoryByCategory(
  category: string,
  offset: number,
  limit: number,
): Promise<StoryResp[]> {
  const { data, error } = await api.GET('/v1/story/category/page', {
    params: {
      query: {
        category,
        offset,
        limit,
      },
    },
  })
  if (error) throw error
  if (!data) throw new Error('Empty response')
  return data
}
