<template>
  <div v-if="!questionAgent.running">

    <label for="questionAgentCommand" class="block text-sm font-medium leading-6 text-gray-900">{{
      t('questionAgentCommand')
    }}</label>
    <div class="relative mt-2 flex items-center">
      <input
        type="text"
        name="questionAgentCommand"
        id="questionAgent"
        v-model="userInput"
        @keydown.enter.prevent="onEnterKey"
        class="block w-full rounded-md border-0 px-2 py-1.5 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      />
      <div class="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
        <button
          type="button"
          @click="submit"
          class="inline-flex items-center rounded px-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 focus:outline-none"
        >
          {{ t('submit') }}
        </button>
      </div>
    </div>
    <label for="suggestion" class="block mt-5 text-md font-medium leading-6 text-gray-900">{{
      t('suggestion')
    }}</label>
    <ul
      class="mt-5 w-full divide-y divide-gray-200 rounded-md border border-gray-200 bg-white text-sm text-gray-700 shadow"
      role="list"
    >
      <li>
        <button
          type="button"
          class="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          @click="submitQ1"
        >
          {{ t('q1') }}
        </button>
        <button
          type="button"
          class="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          @click="submitQ2"
        >
          {{ t('q2') }}
        </button>
        <button
          type="button"
          class="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          @click="submitQ3"
        >
          {{ t('q3') }}
        </button>
        <button
          type="button"
          class="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          @click="submitQ4"
        >
          {{ t('q4') }}
        </button>
      </li>
    </ul>
  </div>
  <div v-else class="flow-root">
    <ul role="list" class="-mb-8">
      <div v-for="(event, i) in questionAgent.events" :key="i">
        <div class="relative pb-8">
          <span
            v-if="i !== questionAgent.events.length - 1"
            class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
            aria-hidden="true"
          />
          <div class="relative flex space-x-3">
            <div>
              <span
                :class="[
                  getBackground(event.type),
                  'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white',
                ]"
              >
                <component
                  :is="getIcon(event.type)"
                  class="h-5 w-5 text-white"
                  aria-hidden="true"
                />
              </span>
            </div>
            <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
              <div v-if="event.type === 'message'">
                <p class="text-sm text-gray-500">
                  {{ event.data?.message }}
                </p>
              </div>
              <div v-else-if="event.type === 'thinking'">
                <p class="text-md font-bold text-gray-800">{{ t('thinking') }}</p>
              </div>
              <div v-else-if="event.type === 'tool_call'">
                <ToolDescripton
                  :tool_name="event.data?.tool_name ?? ''"
                  :tool_data="event.data?.tool_data"
                />
              </div>
              <div v-else-if="event.type === 'result'">
                {{ t('success') }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="questionAgent.isStreaming">
        <div class="relative pb-8">
          <span
            v-if="questionAgent.events.length > 1"
            class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
            aria-hidden="true"
          />
          <div class="relative flex space-x-3">
            <div>
              <span class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white">
                <ChatBubbleLeftEllipsisIcon class="h-5 w-5 text-white" aria-hidden="true" />
              </span>
            </div>
            <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
              <div>
                <p class="text-sm text-gray-500">{{ questionAgent.streamText }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ul>
  </div>
  <div></div>
</template>

<script setup lang="ts">
import { questionAgentController } from '@/controller/questionAgent'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ToolDescripton from '@/components/event/ToolDescripton.vue'

const { t } = useI18n()

const questionAgent = questionAgentController()
const userInput = ref('')

import {
  WrenchIcon,
  LightBulbIcon,
  CircleStackIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckIcon,
} from '@heroicons/vue/20/solid'

const getBackground = (type: string) => {
  if (type === 'message') return 'bg-gray-400'
  if (type === 'thinking') return 'bg-yellow-400'
  if (type === 'tool_call') return 'bg-blue-400'
  return 'bg-gray-400'
}

const getIcon = (type: string) => {
  if (type === 'message') return ChatBubbleLeftEllipsisIcon
  if (type === 'thinking') return LightBulbIcon
  if (type === 'tool_call') return WrenchIcon
  if (type === 'result') return CheckIcon
  return CircleStackIcon
}

const submit = () => {
  if (userInput.value.trim().length === 0) return
  questionAgent.start(userInput.value)
}

const submitQ1 = () => {
  questionAgent.start(t('q1'))
}

const submitQ2 = () => {
  questionAgent.start(t('q2'))
}

const submitQ3 = () => {
  questionAgent.start(t('q3'))
}

const submitQ4 = () => {
  questionAgent.start(t('q4'))
}

const onEnterKey = (e: KeyboardEvent) => {
  const event = e as KeyboardEvent
  if (event.metaKey || event.ctrlKey) {
    e.preventDefault()
    submit()
  }
}
</script>
