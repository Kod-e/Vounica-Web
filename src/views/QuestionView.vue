<template>
  <div>
    <div v-if="controller.status === 'presenting' || controller.status === 'answered'">
      <QuestionRouteView />
    </div>
    <div v-else-if="controller.status === 'feedback'">
      <QuestionRouteView />
    </div>
    <div v-else-if="controller.status === 'evaluating'"></div>
    <div v-else-if="controller.status === 'finished'"></div>
  </div>
</template>

<script setup lang="ts">
import { questionController } from '@/controller/question'
import QuestionRouteView from './QuestionRouteView.vue'

const controller = questionController()
</script>
