import { api } from '@/lib/api'
import type { components } from '@/types/api'

type MistakeResp = components['schemas']['MistakeSchema']

export async function fetchMistakes(offset: number, limit: number): Promise<MistakeResp[]> {
  const { data, error } = await api.GET('/v1/mistake/page', {
    query: {
      offset,
      limit,
    },
  })
  if (error) throw error
  if (!data) throw new Error('Empty response')
  return data
}
