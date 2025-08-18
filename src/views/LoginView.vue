<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2
        class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white"
      >
        {{ isRegister ? t('createAccountTitle') : t('signInTitle') }}
      </h2>
      <div class="mt-6 flex justify-center">
        <button
          type="button"
          @click="toggleMode"
          class="rounded-md px-3 py-1.5 text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
        >
          {{ isRegister ? t('switchToLogin') : t('switchToRegister') }}
        </button>
      </div>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" action="#" method="POST" @submit.prevent="onSubmit">
        <div v-if="isRegister">
          <label for="name" class="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">{{
            t('name')
          }}</label>
          <div class="mt-2">
            <input
              v-model="name"
              type="text"
              name="name"
              id="name"
              autocomplete="name"
              required
              class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
            />
          </div>
        </div>

        <div>
          <label for="email" class="block text-sm/6 font-medium text-gray-900 dark:text-gray-100">{{
            t('email')
          }}</label>
          <div class="mt-2">
            <input
              v-model="email"
              type="email"
              name="email"
              id="email"
              autocomplete="email"
              required
              class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
            />
          </div>
        </div>

        <div>
          <label
            for="password"
            class="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
            >{{ t('password') }}</label
          >
          <div class="mt-2">
            <input
              v-model="password"
              type="password"
              name="password"
              id="password"
              autocomplete="current-password"
              required
              class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
            />
          </div>
        </div>

        <div>
          <button
            :disabled="loading"
            type="submit"
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500 disabled:opacity-60"
          >
            {{
              loading
                ? isRegister
                  ? t('creating')
                  : t('signingIn')
                : isRegister
                  ? t('createAccount')
                  : t('signIn')
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { authLogin, authRegister } from '@/lib/authClient'
import { useAuthStore } from '@/stores/auth'
import { useNotifyStore } from '@/stores/notify'

const router = useRouter()
const { t } = useI18n()

const isRegister = ref(false)
const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)

const authStore = useAuthStore()
const notify = useNotifyStore()

function toggleMode() {
  isRegister.value = !isRegister.value
}

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'string') return err
  if (err && typeof err === 'object') {
    const anyErr = err as { detail?: unknown; message?: unknown }
    if (typeof anyErr.detail === 'string') return anyErr.detail
    if (typeof anyErr.message === 'string') return anyErr.message
  }
  return isRegister.value ? t('registerFailed') : t('loginFailed')
}

async function onSubmit() {
  if (isRegister.value) {
    if (!name.value || !email.value || !password.value) return
  } else {
    if (!email.value || !password.value) return
  }

  loading.value = true
  try {
    if (isRegister.value) {
      const { access_token, refresh_token } = await authRegister({
        name: name.value,
        email: email.value,
        password: password.value,
      })
      authStore.setTokens(access_token, refresh_token)
    } else {
      const { access_token, refresh_token } = await authLogin({
        email: email.value,
        password: password.value,
      })
      authStore.setTokens(access_token, refresh_token)
    }
    router.push({ name: 'home' })
  } catch (err: unknown) {
    notify.addNotify(extractErrorMessage(err))
  } finally {
    loading.value = false
  }
}
</script>
