<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppBar from './components/AppBar.vue'
import NotifyOver from './components/NotifyOver.vue'
import { questionController } from './controller/question'
import QuestionView from './views/QuestionView.vue'

const controller = questionController()
</script>

<template>
  <AppBar>
    <div v-if="controller.is_open">
      <QuestionView />
    </div>
    <div v-else>
      <RouterView />
    </div>
  </AppBar>
  <NotifyOver />
</template>

<style scoped></style>
