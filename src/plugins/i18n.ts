/* eslint-disable @typescript-eslint/no-explicit-any */

import { createI18n } from 'vue-i18n'

import en from '@/locales/en.json'
import ja from '@/locales/ja.json'
import zh from '@/locales/zh.json'

const SUPPORTED = ['en', 'ja', 'zh']
// 尝试从 pinia 持久化的数据中读取之前选择的语言
let initialLocale: string | undefined
try {
  const persisted = localStorage.getItem('lang')
  if (persisted) {
    const parsed = JSON.parse(persisted) as { acceptLanguage?: string }
    if (parsed && typeof parsed.acceptLanguage === 'string') {
      initialLocale = parsed.acceptLanguage
    }
  }
} catch {
  // 可能在 SSR / 无 localStorage 环境，忽略错误
}

if (!initialLocale) {
  const browserLang = navigator.languages?.[0] ?? navigator.language ?? 'en'
  const short = browserLang.toLowerCase().split('-')[0]
  if (SUPPORTED.includes(short)) initialLocale = short
}

console.log('initialLocale', initialLocale)

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    ja,
    zh,
  },
} as any)
