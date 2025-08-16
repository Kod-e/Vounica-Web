<template>
  <ul role="list" class="-mb-8">
    <div v-for="(event, i) in recordAgent.events" :key="i">
      <div class="relative pb-8">
        <span
          v-if="i !== recordAgent.events.length - 1"
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
              <component :is="getIcon(event.type)" class="h-5 w-5 text-white" aria-hidden="true" />
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
              <div v-if="/^add_.*_question$/.test(event.data?.tool_name ?? '')">
                {{ t('addQuestion') }}
              </div>
              <div v-else-if="event.data?.tool_name === 'search_resource'">
                {{ t('searchResource') }}
              </div>
              <p v-else class="text-sm text-gray-500">
                {{ event.data?.tool_name }}: {{ event.data?.tool_input }}
              </p>
            </div>
            <div v-else-if="event.type === 'result'">
              {{ t('success') }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="recordAgent.isStreaming">
      <div class="relative pb-8">
        <span
          v-if="recordAgent.events.length > 1"
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
              <p class="text-sm text-gray-500">{{ recordAgent.streamText }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ul>
</template>

<script setup lang="ts">
import { recordAgentController } from '@/controller/recordAgent'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const recordAgent = recordAgentController()

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
</script>
