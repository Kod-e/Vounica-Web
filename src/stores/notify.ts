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
    deleteNotifyByContent(content: string) {
      const index = this.notify.indexOf(content)
      if (index !== -1) {
        this.notify.splice(index, 1)
      }
    },
    clearNotify() {
      this.notify = []
    },
  },
})
