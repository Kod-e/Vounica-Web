import { defineStore } from 'pinia'
import { i18n } from '@/plugins/i18n'

export const useLangStore = defineStore('lang', {
  state: () => {
    // Initialize from detected UI locale (set in i18n.ts)
    const system = (i18n.global.locale.value as string) || 'en'
    const accept = system
    // Rule: if system language is not English, target is English; otherwise target is Japanese
    const target = system !== 'en' ? 'en' : 'ja'

    return {
      acceptLanguage: accept,
      targetLanguage: target,
    }
  },
  actions: {
    setAcceptLanguage(lang: string) {
      this.acceptLanguage = lang
      i18n.global.locale.value = lang // 实时切换 UI 语言
      // Prevent accept/target from being identical; apply rule for target fallback
      if (this.targetLanguage === this.acceptLanguage) {
        this.targetLanguage = this.acceptLanguage === 'en' ? 'ja' : 'en'
      }
    },
    setTargetLanguage(lang: string) {
      // Prevent accept/target from being identical; if same, choose fallback by rule
      if (lang === this.acceptLanguage) {
        this.targetLanguage = this.acceptLanguage === 'en' ? 'ja' : 'en'
      } else {
        this.targetLanguage = lang
      }
    },
  },

  // afterRestore 由 pinia-plugin-persistedstate 提供，这里使用 double cast 规避类型缺失
  persist: {
    afterRestore: (ctx: { store: { acceptLanguage: string } }) => {
      i18n.global.locale.value = ctx.store.acceptLanguage
    },
  } as unknown as Record<string, unknown>,
})
