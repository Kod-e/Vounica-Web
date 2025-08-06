import { defineStore } from 'pinia'
import { i18n } from '@/plugins/i18n'

export const useLangStore = defineStore('lang', {
  state: () => ({
    acceptLanguage: 'en',
    targetLanguage: 'ja',
  }),
  actions: {
    setAcceptLanguage(lang: string) {
      this.acceptLanguage = lang
      i18n.global.locale.value = lang // 实际切换 UI 语言
    },
    setTargetLanguage(lang: string) {
      this.targetLanguage = lang
    },
  },
})
