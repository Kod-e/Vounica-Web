<template>
  <div>
    <h1 class="text-lg text-gray-900 mb-4">{{ t('suggestion') }}</h1>
    <div v-if="controller.suggestion">
      <p class="text-md text-gray-900 mb-2">{{ controller.suggestion }}</p>
    </div>

    <div
      :class="'bg-' + (judge_result.correct ? 'green' : 'red') + '-100 p-6 rounded-md'"
      v-for="judge_result in controller.judge_results"
      :key="judge_result.question"
    >
      <p class="text-md text-gray-900 mb-2">{{ t('question') }}</p>
      <p class="text-md text-gray-900 mb-2">{{ judge_result.question }}</p>
      <p class="text-md text-gray-900 mb-2" v-if="judge_result.correct">{{ t('correct') }}</p>
      <p class="text-md text-gray-900 mb-2" v-else>{{ t('incorrect') }}</p>
      <p class="text-md text-gray-900 mb-2">{{ t('answer') }}</p>
      <p class="text-md text-gray-500 mb-2">{{ judge_result.answer }}</p>
      <div v-if="!judge_result.correct">
        <p class="text-md text-gray-900 mb-2">{{ t('correct_answer') }}</p>
        <p class="text-md text-gray-500 mb-2">{{ judge_result.correct_answer }}</p>
        <p class="text-md text-gray-900 mb-2">{{ t('error_reason') }}</p>
        <p class="text-md text-gray-500 mb-2">{{ judge_result.error_reason }}</p>
      </div>
    </div>

    <!-- Finish button at bottom -->
    <div class="mt-8">
      <button
        type="button"
        class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-white text-sm font-semibold hover:bg-indigo-500 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        @click="onFinish"
      >
        {{ t('finish') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { questionController } from '@/controller/question'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const controller = questionController()

function onFinish() {
  controller.$reset()
}
</script>
