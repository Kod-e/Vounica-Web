<template>
  <div>
    <h1>RecordFeedBackView</h1>
    <div v-if="controller.suggestion">
      <p>{{ controller.suggestion }}</p>
    </div>
    <div v-for="judge_result in controller.judge_results" :key="judge_result.question">
      <p>{{ judge_result.question }}</p>
      <p>{{ judge_result.answer }}</p>
      <p>{{ judge_result.correct_answer }}</p>
      <p>{{ judge_result.error_reason }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { questionController } from '@/controller/question'

const controller = questionController()
</script>
