import { defineStore } from 'pinia'
import type { Question, QuestionAgentEvent, StreamController } from '@/service/questionAgent'
import { runQuestionAgentStream } from '@/service/questionAgent'

export const questionAgentController = defineStore('questionAgent', {
  state: () => ({
    messages: [] as { emoji: string; message: string }[],
    questions: [] as Question[],
    running: false,
    _stream: null as StreamController | null,
  }),
  actions: {
    async start(userInput: string) {
      if (this.running) this.stop()
      this.messages = []
      this.questions = []
      this.running = true
      this._stream = await runQuestionAgentStream(userInput, (ev: QuestionAgentEvent) => {
        if (ev.type === 'message') {
          this.messages.push(ev.data)
        } else if (ev.type === 'result') {
          this.questions = ev.data
        }
      })
    },
    stop() {
      if (this._stream) {
        this._stream.cancel()
        this._stream = null
      }
      this.running = false
    },
  },
})
