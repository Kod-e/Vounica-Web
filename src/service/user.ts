import { api } from '@/lib/api'
import type { components } from '@/types/api'
import { useUserStore } from '@/stores/user'

type UserResp = components['schemas']['UserSchema']

export async function fetchUser(): Promise<UserResp> {
  const userStore = useUserStore()
  const { data, error } = await api.GET('/v1/user/me', {})
  if (error) throw error
  if (!data) throw new Error('Empty response')
  userStore.setUser(data)
  return data
}
