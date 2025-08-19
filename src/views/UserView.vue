<template>
  <div>
    <div class="px-4 sm:px-0">
      <h3 class="text-base/7 font-semibold text-gray-900">{{ $t('profile') }}</h3>
      <p class="mt-1 max-w-2xl text-sm/6 text-gray-500">{{ $t('profileDescription') }}</p>
    </div>
    <div class="mt-6 border-t border-gray-100">
      <dl class="divide-y divide-gray-100">
        <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt class="text-sm/6 font-medium text-gray-900">{{ $t('name') }}</dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">{{ name }}</dd>
        </div>
        <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt class="text-sm/6 font-medium text-gray-900">{{ $t('email') }}</dt>
          <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
            {{ email }}
          </dd>
        </div>
      </dl>
      <div class="mt-10">
        <dd v-if="isGuestEmail" class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
          <button
            type="button"
            @click="toRegisterOrLogin"
            class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {{ $t('registerLogin') }}
          </button>
        </dd>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const userStore = useUserStore()

const name = computed(() => userStore.name)
const email = computed(() => userStore.email)

const isGuestEmail = computed(() => (email.value ?? '').startsWith('guest'))

const toRegisterOrLogin = () => {
  router.push('/login')
}
</script>
