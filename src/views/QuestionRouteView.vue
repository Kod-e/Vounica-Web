<template>
  <div v-if="controller.question!.question_type === 'choice'">
    <ChoiceView />
  </div>
  <div v-else-if="controller.question!.question_type === 'match'"></div>
  <div v-else-if="controller.question!.question_type === 'assembly'"></div>
</template>

<script setup lang="ts">
import { questionController } from '@/controller/question'
import ChoiceView from './questions/ChoiceView.vue'

const controller = questionController()
</script>
