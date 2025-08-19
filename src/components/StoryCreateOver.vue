<template>
  <div
    v-if="open"
    aria-live="assertive"
    class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
  >
    <div class="absolute inset-0 bg-black/30" @click="onClose" />
    <div
      class="relative w-full max-w-lg rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 p-5 space-y-4"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-gray-900">{{ t('addStory') }}</h3>
        <button
          type="button"
          @click="onClose"
          class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <span class="sr-only">Close</span>
          <XMarkIcon class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('content') }}</label>
          <textarea
            v-model="content"
            rows="6"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            :placeholder="t('content')"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            t('selectCategory')
          }}</label>
          <div class="flex gap-2">
            <select
              v-model="selectedTab"
              class="block w-1/2 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option v-for="tab in tabs" :key="tab.name" :value="tab.name">{{ tab.name }}</option>
              <option :value="NEW_CATEGORY_VALUE">{{ t('newCategory') }}</option>
            </select>
            <input
              v-if="selectedTab === NEW_CATEGORY_VALUE"
              v-model="newCategory"
              type="text"
              class="block w-1/2 rounded-md border-gray-300 py-2 px-3 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              :placeholder="t('inputNewCategory')"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button
          type="button"
          class="rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          @click="onClose"
        >
          {{ t('cancel') }}
        </button>
        <button
          type="button"
          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          :disabled="loading || !content.trim() || !computedCategory"
          @click="onConfirm"
        >
          {{ loading ? t('creating') : t('confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/20/solid'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  open: boolean
  tabs: { name: string }[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', payload: { content: string; category: string }): void
}>()

const { t } = useI18n()

const NEW_CATEGORY_VALUE = '__NEW__'
const content = ref('')
const selectedTab = ref<string | null>(null)
const newCategory = ref('')

watch(
  () => props.open,
  (val) => {
    if (val) {
      content.value = ''
      selectedTab.value = props.tabs?.[0]?.name ?? null
      newCategory.value = ''
    }
  },
)

const loading = computed(() => !!props.loading)

const computedCategory = computed(() => {
  if (selectedTab.value === NEW_CATEGORY_VALUE) return newCategory.value.trim()
  return selectedTab.value?.trim() ?? ''
})

function onClose() {
  emit('close')
}

function onConfirm() {
  if (loading.value) return
  const category = computedCategory.value
  if (!content.value.trim() || !category) return
  emit('confirm', { content: content.value.trim(), category })
}
</script>
