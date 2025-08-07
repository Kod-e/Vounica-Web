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
      i18n.global.locale.value = lang // 实时切换 UI 语言
    },
    setTargetLanguage(lang: string) {
      this.targetLanguage = lang
    },
  },

  // afterRestore 由 pinia-plugin-persistedstate 提供，这里使用 double cast 规避类型缺失
  persist: {
    afterRestore: (ctx: { store: { acceptLanguage: string } }) => {
      i18n.global.locale.value = ctx.store.acceptLanguage
    },
  } as unknown as Record<string, unknown>,
})
