<template>
  <div>
    <div v-if="controller.status === 'presenting' || controller.status === 'answered'">
      <QuestionRouteView />
    </div>
    <div v-else-if="controller.status === 'feedback'">
      <QuestionRouteView />
      <FeedBackOver />
    </div>
    <div v-else-if="controller.status === 'evaluating'">
      <RecordAgentView />
    </div>
    <div v-else-if="controller.status === 'finished'">
      <RecordFeedBackView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { questionController } from '@/controller/question'
import QuestionRouteView from './QuestionRouteView.vue'
import FeedBackOver from '@/components/FeedBackOver.vue'
import RecordAgentView from './RecordAgentView.vue'
import RecordFeedBackView from './RecordFeedBackView.vue'

const controller = questionController()
</script>
