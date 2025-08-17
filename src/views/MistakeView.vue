<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-base font-semibold leading-6 text-gray-900">{{ t('mistake') }}</h1>
        <p class="mt-2 text-sm text-gray-700">{{ t('mistakeViewDescription') }}</p>
      </div>
    </div>
    <div class="mt-8 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle">
          <table class="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th
                  scope="col"
                  class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                >
                  {{ t('question') }}
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  {{ t('error_reason') }}
                </th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  {{ t('answer') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white" v-if="!mistakeStore.isLoading">
              <tr v-for="mistake in mistakes" :key="mistake.id!">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                  {{ mistake.question }}
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:pl-6 lg:pl-8">
                  {{ mistake.error_reason }}
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {{ mistake.answer }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="mt-8 flex justify-between">
      <button
        type="button"
        class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        @click="mistakeStore.prevPage()"
      >
        {{ mistakeStore.isLoading ? 'Loading...' : t('prevPage') }}
      </button>
      <button
        type="button"
        class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        @click="mistakeStore.nextPage()"
      >
        {{ mistakeStore.isLoading ? 'Loading...' : t('nextPage') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mistakeController } from '@/controller/mistake'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const mistakeStore = mistakeController()

onMounted(() => {
  mistakeStore.fetchMistakes()
})

const mistakes = computed(() => mistakeStore.mistakes)
</script>
