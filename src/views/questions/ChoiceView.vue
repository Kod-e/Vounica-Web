<template>
  <div class="ml-3 mt-10 mb-10 text-sm leading-6">
    <label for="comments" class="font-bold text-lg text-gray-900">{{ question.stem }}</label>
  </div>
  <div class="space-y-4 mt-30">
    <div
      v-for="option in question.options"
      :key="option"
      class="relative items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 cursor-pointer transition-colors duration-200"
      :class="option === question.answer ? 'bg-indigo-600 border-indigo-600' : ''"
      @click="onSelect(option)"
    >
      <p
        class="font-medium transition-colors duration-200"
        :class="option === question.answer ? 'text-base' : 'text-gray-900 text-sm'"
      >
        {{ option }}
      </p>
    </div>
  </div>
  <div v-if="isAnswered" class="mt-20">
    <button
      class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      @click="onSubmit"
    >
      <p class="text-md font-bold mt-2 mb-2">{{ t('submit') }}</p>
    </button>
  </div>
</template>

<script setup lang="ts">
import { questionController } from '@/controller/question'
import { computed } from 'vue'
import type { components } from '@/types/api'
import { useI18n } from 'vue-i18n'

type ChoiceQuestion = components['schemas']['ChoiceQuestion']
const controller = questionController()
const question = computed(() => controller.question as ChoiceQuestion)
const isAnswered = computed(() => controller.status === 'answered')
const { t } = useI18n()
function isChoiceQuestion(q: unknown): q is ChoiceQuestion {
  return !!q && typeof q === 'object' && (q as ChoiceQuestion).question_type === 'choice'
}

function onSelect(option: string) {
  controller.status = 'answered'
  const q = controller.question
  if (isChoiceQuestion(q)) {
    q.answer = option
  }
}
function onSubmit() {
  if (question.value.answer === question.value.correct_answer) {
    controller.correct()
  } else {
    controller.incorrect()
  }
}
</script>
