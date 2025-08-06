/* eslint-disable @typescript-eslint/no-explicit-any */

import { createI18n } from 'vue-i18n'

import en from '@/locales/en.json'
import ja from '@/locales/ja.json'
import zh from '@/locales/zh.json'

// 使用 Composition API，因此 legacy 设为 false
export const i18n = createI18n({
  legacy: false,
  locale: 'en', // 默认 UI 语言
  fallbackLocale: 'en',
  messages: {
    en,
    ja,
    zh,
  },
} as any)
