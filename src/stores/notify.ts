import { defineStore } from 'pinia'

export const useNotifyStore = defineStore('notify', {
  state: () => ({
    notify: [] as string[],
  }),

  getters: {
    hasNotify: (state) => state.notify.length > 0,
    notifyThree: (state) => state.notify.slice(0, 3),
  },

  actions: {
    addNotify(notify: string) {
      this.notify.push(notify)
    },
    deleteNotify(index: number) {
      this.notify.splice(index, 1)
    },
    deleteNotifyByContent(content: string) {
      this.notify = this.notify.filter((notify) => notify !== content)
    },
    clearNotify() {
      this.notify = []
    },
  },
})
