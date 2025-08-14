<template>
  <div class="fixed inset-x-0 bottom-0 z-50 pointer-events-none">
    <div
      class="pointer-events-auto rounded-t-2xl shadow-2xl h-[30vh] translate-y-0 transition-transform duration-300 ease-out"
      :class="[isShow ? 'translate-y-0' : 'translate-y-full', overlayBgClass]"
    >
      <div class="flex justify-center items-center h-1/4">
        <p class="text-lg font-bold">{{ isCorrect ? t('correct') : t('incorrect') }}</p>
      </div>
      <div class="flex justify-center items-center h-1/4">
        <p class="text-md text-gray-600 font-semibold">{{ text }}</p>
      </div>
      <div class="flex justify-center items-center h-1/4">
        <div class="pt-4 w-1/2">
          <button
            type="button"
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
            @click="onNext"
          >
            {{ t('next') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { questionController } from '@/controller/question'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { t } = useI18n()
const controller = questionController()
const isShow = computed(() => controller.status === 'feedback')
const text = computed(() => controller.feedback_text)
const isCorrect = computed(() => controller.is_correct)

const overlayBgClass = computed(() => (isCorrect.value === false ? 'bg-rose-500' : 'bg-violet-500'))

function onNext() {
  controller.next()
}
</script>
