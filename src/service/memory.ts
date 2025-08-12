import { api } from '@/lib/api'
import type { components } from '@/types/api'

type MemoryResp = components['schemas']['MemorySchema']

export async function fetchMemories(offset: number, limit: number): Promise<MemoryResp[]> {
  const { data, error } = await api.GET('/v1/memory/page', {
    query: {
      offset,
      limit,
    },
  })
  if (error) throw error
  if (!data) throw new Error('Empty response')
  return data
}

export async function fetchMemoryCategories(): Promise<string[]> {
  const { data, error } = await api.GET('/v1/memory/categories')
  if (error) throw error
  if (!data) throw new Error('Empty response')
  return data
}

export async function fetchMemoryByCategory(
  category: string,
  offset: number,
  limit: number,
): Promise<MemoryResp[]> {
  const { data, error } = await api.GET('/v1/memory/category/page', {
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
