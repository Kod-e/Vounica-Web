// 看起来目前实现了其他的端口, 但是我希望接受来自QuestionAgent的SSE Stream, 并且解码每一个Event, 按照需求放进pinia, 并且通过pinia的特性显示在页面上
import { apiBase } from '@/lib/apiBase'
import { buildAuthHeaders, getAuthHandlers } from '@/lib/api'

export type AgentMessageEvent = {
  type: 'message'
  data: { emoji: string; message: string }
}

export type ChoiceQuestion = {
  question_type: 'choice'
  stem: string
  options: string[]
  correct_answer: string
  answer: string | null
}
export type MatchQuestion = {
  question_type: 'match'
  left_options: string[]
  right_options: string[]
  correct_answer: [string, string][]
  answer: [string, string][] | null
}
export type AssemblyQuestion = {
  question_type: 'assembly'
  stem: string
  options: string[]
  correct_answer: string[]
  answer: string[] | null
}
export type Question = ChoiceQuestion | MatchQuestion | AssemblyQuestion

export type QuestionAgentResult = {
  type: 'result'
  data: Question[]
}

export type QuestionAgentEvent = AgentMessageEvent | QuestionAgentResult

export type StreamController = {
  cancel: () => void
}

export async function runQuestionAgentStream(
  userInput: string,
  onEvent: (ev: QuestionAgentEvent) => void,
): Promise<StreamController> {
  const url = `${apiBase}/v1/question/agent/chat/stream`
  const controller = new AbortController()

  const headers = await buildAuthHeaders({
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  })

  const resp = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(userInput),
    signal: controller.signal,
  })

  if (resp.status === 401) {
    const h = getAuthHandlers()
    if (h) await h.onAuthLost()
    throw new Error('UNAUTHORIZED')
  }
  if (!resp.ok || !resp.body) {
    throw new Error(`Request failed: ${resp.status}`)
  }

  // 断言 body 存在
  const stream = resp.body
  if (!stream) throw new Error('No response body')

  const reader = stream.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  ;(async () => {
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        // 解析完整帧
        const splitIndex = buffer.lastIndexOf('\n\n')
        if (splitIndex !== -1) {
          const blocks = buffer.slice(0, splitIndex + 2)
          buffer = buffer.slice(splitIndex + 2)
          const frames = blocks.split(/\n\n/).filter(Boolean)
          for (const frame of frames) {
            const dataLine = frame.split(/\r?\n/).find((l) => l.startsWith('data:'))
            if (!dataLine) continue
            const json = dataLine.slice(5).trimStart()
            if (!json) continue
            try {
              const ev = JSON.parse(json) as QuestionAgentEvent
              onEvent(ev)
            } catch {
              // ignore single-frame parse error
            }
          }
        }
      }
      // 处理尾块（无\n\n结尾）
      const tail = buffer.trim()
      if (tail.startsWith('data:')) {
        const json = tail.slice(5).trimStart()
        try {
          const ev = JSON.parse(json) as QuestionAgentEvent
          onEvent(ev)
        } catch {}
      }
    } catch (err) {
      // 只有在主动取消时不抛出
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        throw err
      }
    } finally {
      reader.releaseLock()
    }
  })()

  return {
    cancel: () => controller.abort(),
  }
}
