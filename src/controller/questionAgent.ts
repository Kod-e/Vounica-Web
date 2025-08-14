import { defineStore } from 'pinia'
import type {
  QuestionAgentEvent,
  AgentMessageEvent,
  AgentStreamChunkEvent,
  AgentStreamEndEvent,
} from '@/service/questionAgent'
import { runQuestionAgentStream } from '@/service/questionAgent'

function isStreamChunkEvent(ev: QuestionAgentEvent): ev is AgentStreamChunkEvent {
  return ev.type === 'stream_chunk'
}
function isStreamEndEvent(ev: QuestionAgentEvent): ev is AgentStreamEndEvent {
  return ev.type === 'stream_end'
}

export const questionAgentController = defineStore('questionAgent', {
  state: () => ({
    events: [] as QuestionAgentEvent[],
    running: false,
    isStreaming: false,
    streamText: '' as string,
    _stream: null as null | { cancel: () => void },
  }),
  actions: {
    async start(userInput: string) {
      this.events = []
      this.streamText = ''
      this.isStreaming = false
      this.running = true
      this._stream = await runQuestionAgentStream(userInput, (ev: QuestionAgentEvent) => {
        // 记录除了stream之外的事件
        if (ev.type !== 'stream_chunk' && ev.type !== 'stream_end') {
          this.events.push(ev)
        }

        if (isStreamChunkEvent(ev)) {
          if (!this.isStreaming) {
            this.isStreaming = true
            this.streamText = ''
          }
          const chunk = ev.data?.chunk ?? ''
          if (chunk) this.streamText += chunk
          return
        }

        if (isStreamEndEvent(ev)) {
          const text = this.streamText.trim()
          if (text.length > 0) {
            const messageEvent: AgentMessageEvent = {
              type: 'message',
              data: { emoji: '', message: text },
            }
            this.events.push(messageEvent)
          }
          this.isStreaming = false
          this.streamText = ''
          return
        }
      })
    },
  },
})
