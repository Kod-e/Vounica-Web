import { apiBase } from '@/lib/apiBase'
import { buildAuthHeaders } from '@/lib/api'
import type { components } from '@/types/api'

type RecordAgentEvent = components['schemas']['RecordAgentEvent']
export type ChoiceQuestion = components['schemas']['ChoiceQuestion']
export type MatchQuestion = components['schemas']['MatchQuestion']
export type AssemblyQuestion = components['schemas']['AssemblyQuestion']

export type Question = ChoiceQuestion | MatchQuestion | AssemblyQuestion

export type StreamController = {
  cancel: () => void
}

export async function runRecordAgentStream(
  questions: Question[],
  onEvent: (ev: RecordAgentEvent) => void,
  userInput: string,
): Promise<StreamController> {
  const controller = new AbortController()

  const baseUrl = apiBase.replace(/^http/, 'ws')
  const headers = await buildAuthHeaders()
  const token = headers.get('Authorization')?.replace('Bearer ', '') ?? ''
  const acceptLanguage = headers.get('Accept-Language') ?? ''
  const targetLanguage = headers.get('Target-Language') ?? ''

  const url = new URL('/v1/question/agent/record/ws', baseUrl)
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
      let normalizedQuestions: Question[] | string = questions as unknown as Question[] | string
      if (typeof normalizedQuestions === 'string') {
        try {
          normalizedQuestions = JSON.parse(normalizedQuestions) as Question[]
        } catch {}
      }
      ws.send(
        JSON.stringify({ questions: normalizedQuestions as Question[], user_input: userInput }),
      )
    } catch {}
  }

  ws.onmessage = (evt) => {
    try {
      const data = JSON.parse(evt.data)
      onEvent(data as RecordAgentEvent)
    } catch {}
  }

  ws.onerror = () => {}
  ws.onclose = () => cleanup()

  return {
    cancel: () => controller.abort(),
  }
}
