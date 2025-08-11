import { api } from '@/lib/api'
import type { components } from '@/types/api'

type VocabResp = components['schemas']['VocabSchema']

export async function fetchVocabularies(offset: number, limit: number): Promise<VocabResp[]> {
  const { data, error } = await api.GET('/v1/vocab/page', {
    query: {
      offset,
      limit,
    },
  })
  if (error) throw error
  if (!data) throw new Error('Empty response')
  return data
}

export async function addVocab(vocab: components['schemas']['VocabSchema']): Promise<VocabResp> {
  const { data, error } = await api.POST('/v1/vocab/create', {
    body: vocab,
  })
  if (error) throw error
  if (!data) throw new Error('Empty response')
  return data
}

export async function updateVocab(vocab: components['schemas']['VocabSchema']): Promise<VocabResp> {
  const { data, error } = await api.POST('/v1/vocab/update', {
    body: vocab,
  })
  if (error) throw error
  if (!data) throw new Error('Empty response')
  return data
}

export async function deleteVocab(id: number): Promise<void> {
  const { error } = await api.DELETE('/v1/vocab/delete', {
    params: {
      query: { vocab_id: id },
    },
  })
  if (error) throw error
}
