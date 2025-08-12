<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-base font-semibold leading-6 text-gray-900">{{ t('memory') }}</h1>
        <p class="mt-2 text-sm text-gray-700">{{ t('memoryViewDescription') }}</p>
      </div>
    </div>

    <div v-if="memoryStore.categories.length === 0" class="mt-8">
      <p>{{ t('noCategory') }}</p>
    </div>
    <div v-if="memoryStore.categories.length > 0" class="mt-8 flow-root">
      <div>
        <div class="sm:hidden">
          <label for="tabs" class="sr-only">{{ t('selectCategory') }}</label>
          <select
            id="tabs"
            name="tabs"
            class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            <option
              v-for="tab in tabs"
              :key="tab.name"
              :selected="tab.name === memoryStore.selectedCategory"
              @click="memoryStore.selectCategory(tab.name)"
            >
              {{ tab.name }}
            </option>
          </select>
        </div>
        <div class="hidden sm:block">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8" aria-label="Tabs">
              <a
                v-for="tab in tabs"
                :key="tab.name"
                @click="memoryStore.selectCategory(tab.name)"
                :class="[
                  tab.name === memoryStore.selectedCategory
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                ]"
                :aria-current="tab.name === memoryStore.selectedCategory ? 'page' : undefined"
                >{{ tab.name }}</a
              >
            </nav>
          </div>
        </div>
      </div>
      <div
        v-if="memoryStore.selectedCategory"
        class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8"
      >
        <ul role="list" class="divide-y divide-gray-100">
          <li v-for="memory in memories" :key="memory.id" class="py-5">
            <div class="min-w-0">
              <p class="text-sm/6 text-gray-900 break-all">{{ memory.content }}</p>
            </div>
            <div class="mt-2 flex items-center justify-between">
              <p class="text-xs/5 text-gray-500">{{ t('priority') }}: {{ memory.priority }}</p>
              <p class="text-xs/5 text-gray-500">
                {{ t('updated_at') }}
                <time :datetime="memory.updated_at">{{ memory.updated_at }}</time>
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="mt-8 flex justify-between">
      <button
        type="button"
        class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        @click="memoryStore.prevPage()"
      >
        {{ memoryStore.isLoading ? 'Loading...' : t('prevPage') }}
      </button>
      <button
        type="button"
        class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        @click="memoryStore.nextPage()"
      >
        {{ memoryStore.isLoading ? 'Loading...' : t('nextPage') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { memoryController } from '@/controller/memory'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const memoryStore = memoryController()
const tabs = computed(() => memoryStore.categories.map((category) => ({ name: category })))

onMounted(() => {
  memoryStore.fetchCategories()
  memoryStore.setFakeCategories()
  memoryStore.setFakeMemories()
})

const memories = computed(() => memoryStore.memories)
</script>
