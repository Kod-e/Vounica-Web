import { defineStore } from 'pinia'
import type { components } from '@/types/api'
import { recordAgentController } from './recordAgent'

type JudgeResult = components['schemas']['JudgeResult']

export type ChoiceQuestion = components['schemas']['ChoiceQuestion']
export type MatchQuestion = components['schemas']['MatchQuestion']
export type AssemblyQuestion = components['schemas']['AssemblyQuestion']

export type Question = ChoiceQuestion | MatchQuestion | AssemblyQuestion

// 状态集合
export type SessionStatus =
  | 'presenting'
  | 'answered'
  | 'feedback'
  | 'idle'
  | 'evaluating'
  | 'finished'
  | 'error'

// 对题目做一次快照，避免后续同一对象的修改影响已记录的历史答案
function snapshotQuestion(q: Question): Question {
  try {
    // structuredClone 在现代浏览器可用
    return structuredClone(q)
  } catch {
    // 退化到 JSON 深拷贝
    return JSON.parse(JSON.stringify(q)) as Question
  }
}

export const questionController = defineStore('question', {
  state: () => ({
    is_open: false as boolean,
    user_input: '' as string,
    feedback_text: '' as string,
    status: 'idle' as SessionStatus,
    pending: [] as Question[],
    answers: [] as Question[],
    question: null as Question | null,
    judge_results: null as JudgeResult[] | null,
    is_correct: null as boolean | null,
    suggestion: null as string | null,
  }),

  actions: {
    start() {
      // 初始化当前题；若无待练题则进入 finished
      this.is_correct = null
      if (this.pending.length === 0) {
        this.question = null
        this.status = 'finished'
        return
      }
      this.question = this.pending[0]
      this.status = 'presenting'
    },

    correct() {
      this.is_correct = true
      this.status = 'feedback'
    },
    incorrect() {
      this.is_correct = false
      this.status = 'feedback'
    },
    next() {
      // 按“队列模型”：当前题出队；错题回流到队尾；记录到 answers；前进或评估
      const current = this.question
      if (!current) {
        // 没有当前题，尝试启动或结束
        if (this.pending.length === 0) {
          this.evaluating()
          return
        }
        this.question = this.pending[0]
        this.status = 'presenting'
        return
      }

      // 从 pending 中移除当前题（通常在队首）
      if (this.pending.length > 0 && this.pending[0] === current) {
        this.pending.shift()
      } else {
        const idx = this.pending.indexOf(current)
        if (idx >= 0) this.pending.splice(idx, 1)
      }

      // 记录答案（无论对错，均入 answers）——使用快照，避免后续修改污染历史记录
      this.answers.push(snapshotQuestion(current))

      // 错题回流到队尾
      if (this.is_correct === false) {
        this.pending.push(current)
      }

      // 前进或结束
      this.is_correct = null
      if (this.pending.length > 0) {
        this.question = this.pending[0]
        this.status = 'presenting'
      } else {
        this.question = null
        this.evaluating()
      }
    },
    evaluating() {
      this.status = 'evaluating'
      recordAgentController().start(this.answers, this.user_input)
    },
    finish_evaluating() {
      this.status = 'finished'
    },
  },
})
