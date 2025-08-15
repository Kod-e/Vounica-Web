<template>
  <div>
    <div class="ml-3 mt-10 mb-6">
      <p class="text-2xl font-bold text-gray-900">{{ question.stem }}</p>
    </div>

    <!-- Answer first -->
    <div class="ml-3">
      <div class="text-sm font-medium text-gray-700 mb-2">
        {{ t('your_answer') || 'Your answer' }}
      </div>
      <div class="flex flex-wrap gap-2 min-h-10 p-2 rounded border border-dashed border-gray-300">
        <button
          v-for="(token, idx) in answer"
          :key="`a-${idx}-${token}`"
          type="button"
          class="px-3 py-1.5 rounded-md border border-indigo-300 text-sm bg-indigo-50 hover:border-indigo-400 transition-colors duration-150"
          @click="moveToBank(idx)"
        >
          {{ token }}
        </button>
      </div>
    </div>

    <!-- Word bank below -->
    <div class="ml-3 mt-6">
      <div class="text-sm font-medium text-gray-700 mb-2">
        {{ t('word_bank') || 'Word bank' }}
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="(token, idx) in bank"
          :key="`b-${idx}-${token}`"
          type="button"
          class="px-3 py-1.5 rounded-md border border-gray-300 text-sm bg-white hover:border-gray-400 transition-colors duration-150"
          @click="moveToAnswer(idx)"
        >
          {{ token }}
        </button>
      </div>
    </div>

    <div class="mt-10">
      <button
        class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
        :disabled="answer.length === 0"
        @click="onSubmit"
      >
        <p class="text-md font-bold mt-2 mb-2">{{ t('submit') }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import type { components } from '@/types/api'
import { questionController } from '@/controller/question'

type AssemblyQuestion = components['schemas']['AssemblyQuestion']

const controller = questionController()
const { t } = useI18n()

const question = computed(() => controller.question as AssemblyQuestion)
const bank = ref<string[]>([])
const answer = ref<string[]>([])

function buildBank(options: string[], presetAnswer: string[]): string[] {
  // 根据已有答案，按次数从 options 中扣除，避免重复
  const result = [...options]
  if (!presetAnswer || presetAnswer.length === 0) return result
  const counts: Record<string, number> = {}
  for (const tok of presetAnswer) counts[tok] = (counts[tok] ?? 0) + 1
  return result.filter((tok) => {
    const c = counts[tok] ?? 0
    if (c > 0) {
      counts[tok] = c - 1
      return false
    }
    return true
  })
}

watchEffect(() => {
  // 当题目切换时重置；bank = options - answer（按计数扣减）
  const opts = [...(question.value?.options ?? [])]
  const preset = [...(question.value?.answer ?? [])]
  answer.value = preset
  bank.value = buildBank(opts, preset)
})

function moveToAnswer(index: number) {
  const token = bank.value.splice(index, 1)[0]
  answer.value.push(token)
  syncAnswered()
}
function moveToBank(index: number) {
  const token = answer.value.splice(index, 1)[0]
  bank.value.push(token)
  syncAnswered()
}

function syncAnswered() {
  if (question.value) question.value.answer = [...answer.value]
  controller.status = 'answered'
}

function onSubmit() {
  const corr = question.value.correct_answer
  const ans = answer.value
  const isSame = ans.length === corr.length && ans.every((v, i) => v === corr[i])
  if (isSame) {
    controller.correct()
    controller.feedback_text = t('correct')
  } else {
    controller.incorrect()
    controller.feedback_text = t('correct_answer') + String(corr.join(' '))
  }
}
</script>
