import { api } from '@/lib/api'
import type { components } from '@/types/api'

type GrammarResp = components['schemas']['GrammarSchema']

export async function fetchGrammars(offset: number, limit: number): Promise<GrammarResp[]> {
  const { data, error } = await api.GET('/v1/grammar/page', {
    query: {
      offset,
      limit,
    },
  })
  if (error) throw error
  if (!data) throw new Error('Empty response')
  return data
}
