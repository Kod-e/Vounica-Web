// src/lib/authClient.ts
import createClient from 'openapi-fetch'
import type { paths, components } from '@/types/api'
import { apiBase } from './apiBase'

export const authClient = createClient<paths>({ baseUrl: apiBase })
type LoginReq = components['schemas']['LoginSchema']
type TokenResp = components['schemas']['TokenSchema']
type RefreshReq = components['schemas']['RefreshSchema'] // { refresh_token }
type RefreshResp = components['schemas']['RefreshResponseSchema'] // { access_token }
type RegisterReq = components['schemas']['RegisterSchema']
type RegisterResp = components['schemas']['RegisterResponseSchema']

export async function authLogin(body: LoginReq): Promise<TokenResp> {
  const { data, error } = await authClient.POST('/v1/auth/login', { body })
  if (error || !data) throw error
  return data
}

export async function authGuest(): Promise<TokenResp> {
  const { data, error } = await authClient.POST('/v1/auth/guest')
  if (error || !data) throw error
  return data
}

export async function authRefresh(body: RefreshReq): Promise<RefreshResp> {
  const { data, error } = await authClient.POST('/v1/auth/refresh', { body })
  if (error || !data) throw error
  return data
}

export async function authRegister(body: RegisterReq): Promise<RegisterResp> {
  const { data, error } = await authClient.POST('/v1/auth/register', { body })
  if (error || !data) throw error
  return data
}
