import { defineStore } from 'pinia'
import type { Question } from '@/service/recordAgent'
import { runRecordAgentStream } from '@/service/recordAgent'
import type { components } from '@/types/api'
import { questionController } from './question'

type RecordAgentEvent = components['schemas']['RecordAgentEvent']
type AgentStreamChunkEvent = components['schemas']['AgentStreamChunkEvent']
type AgentStreamEndEvent = components['schemas']['AgentStreamEndEvent']
type AgentMessageEvent = components['schemas']['AgentMessageEvent']

function isStreamChunkEvent(ev: RecordAgentEvent): ev is AgentStreamChunkEvent {
  return ev.type === 'stream_chunk'
}

function isStreamEndEvent(ev: RecordAgentEvent): ev is AgentStreamEndEvent {
  return ev.type === 'stream_end'
}

export const recordAgentController = defineStore('recordAgent', {
  state: () => ({
    events: [] as RecordAgentEvent[],
    running: false,
    isStreaming: false,
    streamText: '' as string,
    _stream: null as null | { cancel: () => void },
  }),
  actions: {
    async start(questions: Question[]) {
      this.events = []
      this.running = true
      this.isStreaming = false
      this.streamText = '' as string
      this._stream = await runRecordAgentStream(questions, (ev: RecordAgentEvent) => {
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

        if (ev.type === 'result') {
          const resultData = ev.data
          if (resultData) {
            const judgeResults = resultData.judge_results
            questionController().judge_results = judgeResults
            questionController().suggestion = resultData.suggestion
            questionController().finish_evaluating()
          }
        }
      })
    },
  },
})
