<template>
  <h1>QuestionView</h1>
  <input v-model="userInput" />
  <button @click="questionAgent.start(userInput)">Start</button>
  <button @click="questionAgent.stop()" :disabled="!questionAgent.running">Stop</button>
  <div class="flow-root">
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
                <p class="text-md font-bold text-gray-800">thinking...</p>
              </div>
              <div v-else-if="event.type === 'tool_call'">
                <p class="text-sm text-gray-500">
                  🔧 {{ event.data?.tool_name }}: {{ event.data?.tool_input }}
                </p>
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

const questionAgent = questionAgentController()
const userInput = ref('')

import {
  WrenchIcon,
  LightBulbIcon,
  CircleStackIcon,
  ChatBubbleLeftEllipsisIcon,
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
  return CircleStackIcon
}
</script>
