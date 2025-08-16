import { apiBase } from '@/lib/apiBase'
import { buildAuthHeaders } from '@/lib/api'
import type { components } from '@/types/api'

type QuestionAgentEvent = components['schemas']['QuestionAgentEvent']

export type StreamController = {
  // 一开始想到可能会有用的, 不过看起来没用上
  cancel: () => void
}

export async function runQuestionAgentStream(
  userInput: string,
  onEvent: (ev: QuestionAgentEvent) => void,
): Promise<StreamController> {
  const controller = new AbortController()

  // 构造 ws/wss 基础地址
  const baseUrl = apiBase.replace(/^http/, 'ws')
  // 将 token 与语言放入 query，后端也会从 header 兜底
  const headers = await buildAuthHeaders()
  const token = headers.get('Authorization')?.replace('Bearer ', '') ?? ''
  const acceptLanguage = headers.get('Accept-Language') ?? ''
  const targetLanguage = headers.get('Target-Language') ?? ''

  const url = new URL('/v1/question/agent/question/ws', baseUrl)
  if (token) url.searchParams.set('token', token)
  if (acceptLanguage) url.searchParams.set('accept_language', acceptLanguage)
  if (targetLanguage) url.searchParams.set('target_language', targetLanguage)

  const ws = new WebSocket(url.toString())

  let closed = false
  const cleanup = () => {
    if (closed) return
    closed = true
    try {
      ws.close()
    } catch {}
  }

  controller.signal.addEventListener('abort', cleanup)

  ws.onopen = () => {
    try {
      ws.send(JSON.stringify({ user_input: userInput }))
    } catch {}
  }

  ws.onmessage = (evt) => {
    try {
      const data = JSON.parse(evt.data)
      onEvent(data as QuestionAgentEvent)
    } catch {}
  }

  ws.onerror = () => {
    // 401 无法通过 ws.onerror 精准识别，这里交给后端首帧报错或连接拒绝
  }

  ws.onclose = () => {
    cleanup()
  }

  return {
    cancel: () => {
      controller.abort()
    },
  }
}
