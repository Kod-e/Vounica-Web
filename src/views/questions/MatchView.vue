<template>
  <div>
    <div class="ml-3 mt-10 mb-10 text-sm leading-6">
      <label class="font-bold text-lg text-gray-900">Match</label>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Left options with fixed colors (tab style) -->
      <div>
        <ul class="space-y-3">
          <li v-for="(left, li) in question.left_options" :key="left">
            <button
              type="button"
              class="w-full flex items-center justify-between rounded-lg border px-4 py-3 transition-colors duration-200"
              :class="[
                selectedLeftIndex === li || leftPaired(left)
                  ? `${colorBgClass(li)} ${colorBorderClass(li)} text-white font-bold`
                  : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400',
              ]"
              @click="onSelectLeft(li)"
            >
              <div class="flex items-center space-x-3">
                <span class="text-sm">{{ left }}</span>
              </div>
            </button>
          </li>
        </ul>
      </div>

      <!-- Right options selectable; colored by paired left color (tab style) -->
      <div>
        <ul class="space-y-3">
          <li v-for="right in question.right_options" :key="right">
            <button
              type="button"
              class="w-full flex items-center justify-between rounded-lg border px-4 py-3 transition-colors duration-200"
              :class="[
                rightPaired(right)
                  ? `${pairedBgClass(right)} ${pairedBorderClass(right)} text-white font-bold`
                  : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400',
                selectedLeftIndex !== null ? 'cursor-pointer' : 'cursor-default',
              ]"
              @click="onSelectRight(right)"
            >
              <div class="flex items-center space-x-3">
                <span class="text-sm">{{ right }}</span>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="isAnswered" class="mt-10">
      <button
        class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        @click="onSubmit"
      >
        <p class="text-md font-bold mt-2 mb-2">{{ t('submit') }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { questionController } from '@/controller/question'
import type { components } from '@/types/api'

// types
type MatchQuestion = components['schemas']['MatchQuestion']

const controller = questionController()
const { t } = useI18n()

const question = computed(() => controller.question as MatchQuestion)
const isAnswered = computed(() => controller.status === 'answered')

// state
const selectedLeftIndex = ref<number | null>(null)
const pairs = reactive<Record<string, string>>({}) // left -> right

const colorClasses = [
  { dot: 'bg-red-500', border: 'border-red-500' },
  { dot: 'bg-green-500', border: 'border-green-500' },
  { dot: 'bg-yellow-500', border: 'border-yellow-500' },
  { dot: 'bg-purple-500', border: 'border-purple-500' },
]

function colorBorderClass(index: number): string {
  const c = colorClasses[index % colorClasses.length]
  return c.border
}
function colorBgClass(index: number): string {
  return ['bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'][index % 4]
}

function leftPaired(left: string): boolean {
  return !!pairs[left]
}
function rightPaired(right: string): boolean {
  return Object.values(pairs).includes(right)
}

function pairedLeftIndex(right: string): number | null {
  const leftKey = Object.keys(pairs).find((k) => pairs[k] === right)
  if (!leftKey) return null
  return question.value.left_options.indexOf(leftKey)
}

function pairedBorderClass(right: string): string {
  const idx = pairedLeftIndex(right)
  if (idx === null || idx < 0) return ''
  return colorBorderClass(idx)
}
function pairedBgClass(right: string): string {
  const idx = pairedLeftIndex(right)
  if (idx === null || idx < 0) return ''
  return colorBgClass(idx)
}

function updateAnswerAndStatus() {
  const ans = question.value.left_options
    .filter((l) => pairs[l])
    .map((l) => [l, pairs[l]] as [string, string])
  question.value.answer = ans
  controller.status = ans.length === question.value.left_options.length ? 'answered' : 'presenting'
}

function onSelectLeft(index: number) {
  const left = question.value.left_options[index]

  // 再次点击同一左项：若已配对则取消配对；否则仅取消选择
  if (selectedLeftIndex.value === index) {
    if (pairs[left]) delete pairs[left]
    selectedLeftIndex.value = null
    updateAnswerAndStatus()
    return
  }

  // 未处于选择态：若该左项已配对，则单击取消配对；否则进入选择态
  if (selectedLeftIndex.value === null) {
    if (pairs[left]) {
      delete pairs[left]
      updateAnswerAndStatus()
      return
    }
    selectedLeftIndex.value = index
    return
  }

  // 其他左项被选中时，切换选择焦点
  selectedLeftIndex.value = index
}

function onSelectRight(right: string) {
  // 无选择态：若该右项已配对，则单击取消对应配对
  if (selectedLeftIndex.value === null) {
    if (rightPaired(right)) {
      const l = Object.keys(pairs).find((k) => pairs[k] === right)
      if (l) delete pairs[l]
      updateAnswerAndStatus()
    }
    return
  }

  const left = question.value.left_options[selectedLeftIndex.value]

  // 若当前选择的左项已与此右项配对，则点击右项取消该配对
  if (pairs[left] === right) {
    delete pairs[left]
    selectedLeftIndex.value = null
    updateAnswerAndStatus()
    return
  }

  // 若该右项已与其他左项配对，则只取消，不自动改配
  if (rightPaired(right)) {
    const l = Object.keys(pairs).find((k) => pairs[k] === right)
    if (l) delete pairs[l]
    selectedLeftIndex.value = null
    updateAnswerAndStatus()
    return
  }

  // 右项空闲：进行新配对
  pairs[left] = right
  selectedLeftIndex.value = null
  updateAnswerAndStatus()
}

function onSubmit() {
  // 将答案按 left 顺序规范化
  const ans = question.value.left_options.map((l) => [l, pairs[l]] as [string, string])
  const corr = question.value.correct_answer
  const isSame =
    ans.length === corr.length && ans.every((p, i) => p[0] === corr[i][0] && p[1] === corr[i][1])
  if (isSame) {
    controller.correct()
    controller.feedback_text = t('correct')
  } else {
    controller.incorrect()
    controller.feedback_text =
      t('correct_answer') + String(corr.map((x) => `${x[0]}→${x[1]}`).join(', '))
  }
}
</script>
